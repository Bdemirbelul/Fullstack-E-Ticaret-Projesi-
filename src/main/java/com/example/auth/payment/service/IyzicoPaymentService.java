package com.example.auth.payment.service;

import com.example.auth.category.repository.CategoryRepository;
import com.example.auth.exception.ApiException;
import com.example.auth.order.dto.CheckoutRequest;
import com.example.auth.order.dto.DeliveryDetailsRequest;
import com.example.auth.order.entity.Order;
import com.example.auth.order.entity.OrderDeliveryDetail;
import com.example.auth.order.entity.OrderItem;
import com.example.auth.order.service.OrderService;
import com.example.auth.payment.dto.IyzicoCallbackResponse;
import com.example.auth.payment.dto.IyzicoCheckoutResponse;
import com.example.auth.payment.dto.IyzicoInitiateRequest;
import com.example.auth.payment.dto.IyzicoInitiateResponse;
import com.example.auth.payment.entity.PaymentProvider;
import com.example.auth.payment.entity.PaymentStatus;
import com.example.auth.payment.entity.PaymentTransaction;
import com.example.auth.payment.repository.PaymentTransactionRepository;
import com.iyzipay.Options;
import com.iyzipay.model.Address;
import com.iyzipay.model.BasketItem;
import com.iyzipay.model.BasketItemType;
import com.iyzipay.model.Buyer;
import com.iyzipay.model.CheckoutForm;
import com.iyzipay.model.CheckoutFormInitialize;
import com.iyzipay.model.Currency;
import com.iyzipay.model.Locale;
import com.iyzipay.model.PaymentGroup;
import com.iyzipay.request.CreateCheckoutFormInitializeRequest;
import com.iyzipay.request.RetrieveCheckoutFormRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class IyzicoPaymentService {

    private static final Logger log = LoggerFactory.getLogger(IyzicoPaymentService.class);

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderService orderService;
    private final CategoryRepository categoryRepository;

    @Value("${iyzico.base-url:https://sandbox-api.iyzipay.com}")
    private String iyzicoBaseUrl;
    @Value("${iyzico.api-key:}")
    private String iyzicoApiKey;
    @Value("${iyzico.secret-key:}")
    private String iyzicoSecretKey;
    @Value("${iyzico.callback-url:http://localhost:8080/api/payments/iyzico/callback}")
    private String iyzicoCallbackUrl;
    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Transactional
    public IyzicoCheckoutResponse checkoutFromCart(String userEmail, CheckoutRequest checkoutRequest, String clientIp) {
        if (iyzicoApiKey == null || iyzicoApiKey.isBlank() || iyzicoSecretKey == null || iyzicoSecretKey.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Iyzico API key/secret is not configured");
        }

        Order order = orderService.createPendingPaymentFromCart(userEmail, checkoutRequest);
        DeliveryDetailsRequest delivery = checkoutRequest.deliveryDetails();

        String conversationId = String.valueOf(order.getId());
        PaymentTransaction tx = PaymentTransaction.builder()
                .order(order)
                .provider(PaymentProvider.IYZICO)
                .status(PaymentStatus.INITIATED)
                .amount(order.getTotal())
                .paidPrice(money(order.getTotal()))
                .currency(Currency.TRY.name())
                .providerReference(conversationId)
                .build();
        PaymentTransaction saved = paymentTransactionRepository.save(tx);

        CreateCheckoutFormInitializeRequest iyziRequest = buildCheckoutFormInitialize(order, delivery, conversationId, clientIp);
        log.info(
                "Iyzico checkout init conversationId={} orderId={} price={} callbackUrl={} basketId={}",
                iyziRequest.getConversationId(),
                order.getId(),
                iyziRequest.getPrice(),
                iyziRequest.getCallbackUrl(),
                iyziRequest.getBasketId()
        );

        CheckoutFormInitialize initialize = CheckoutFormInitialize.create(iyziRequest, buildOptions());
        log.info(
                "Iyzico init response status={} errorCode={} errorMessage={} token={}",
                initialize.getStatus(),
                initialize.getErrorCode(),
                initialize.getErrorMessage(),
                initialize.getToken()
        );

        if (!"success".equalsIgnoreCase(initialize.getStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Iyzico initialize failed: " + initialize.getErrorCode() + " - " + initialize.getErrorMessage()
            );
        }

        saved.setIyzicoToken(initialize.getToken());
        paymentTransactionRepository.save(saved);

        return new IyzicoCheckoutResponse(
                order.getId(),
                initialize.getCheckoutFormContent(),
                initialize.getPaymentPageUrl(),
                initialize.getToken()
        );
    }

    @Transactional
    public IyzicoInitiateResponse initiate(String userEmail, IyzicoInitiateRequest request) {
        Order order = orderService.getEntity(request.orderId());
        if (!order.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot start payment for another user's order");
        }
        if (iyzicoApiKey == null || iyzicoApiKey.isBlank() || iyzicoSecretKey == null || iyzicoSecretKey.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Iyzico API key/secret is not configured");
        }

        DeliveryDetailsRequest delivery = resolveDeliveryForInitiate(order, request);

        String conversationId = String.valueOf(order.getId());
        PaymentTransaction tx = PaymentTransaction.builder()
                .order(order)
                .provider(PaymentProvider.IYZICO)
                .status(PaymentStatus.INITIATED)
                .amount(order.getTotal())
                .paidPrice(money(order.getTotal()))
                .currency(Currency.TRY.name())
                .providerReference(conversationId)
                .build();
        PaymentTransaction saved = paymentTransactionRepository.save(tx);

        CreateCheckoutFormInitializeRequest iyziRequest = buildCheckoutFormInitialize(order, delivery, conversationId, "127.0.0.1");
        log.info(
                "Iyzico init payload conversationId={} price={} paidPrice={} callbackUrl={} basketId={} buyerEmail={} items={}",
                iyziRequest.getConversationId(),
                iyziRequest.getPrice(),
                iyziRequest.getPaidPrice(),
                iyziRequest.getCallbackUrl(),
                iyziRequest.getBasketId(),
                iyziRequest.getBuyer() != null ? iyziRequest.getBuyer().getEmail() : null,
                iyziRequest.getBasketItems() != null ? iyziRequest.getBasketItems().size() : 0
        );

        CheckoutFormInitialize initialize = CheckoutFormInitialize.create(iyziRequest, buildOptions());
        log.info(
                "Iyzico init response status={} errorCode={} errorMessage={} token={} paymentPageUrl={}",
                initialize.getStatus(),
                initialize.getErrorCode(),
                initialize.getErrorMessage(),
                initialize.getToken(),
                initialize.getPaymentPageUrl()
        );

        if (!"success".equalsIgnoreCase(initialize.getStatus())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Iyzico initialize failed: " + initialize.getErrorCode() + " - " + initialize.getErrorMessage()
            );
        }

        saved.setIyzicoToken(initialize.getToken());
        paymentTransactionRepository.save(saved);

        return new IyzicoInitiateResponse(
                saved.getId(),
                order.getId(),
                initialize.getPaymentPageUrl(),
                conversationId,
                initialize.getCheckoutFormContent(),
                initialize.getToken()
        );
    }

    @Transactional
    public ResponseEntity<Void> handleProviderCallback(String token) {
        log.info("IYZICO CALLBACK TOKEN = {}", token);
        System.out.println("IYZICO CALLBACK TOKEN = " + token);

        Optional<PaymentTransaction> txByToken = paymentTransactionRepository.findByIyzicoToken(token);

        RetrieveCheckoutFormRequest request = new RetrieveCheckoutFormRequest();
        request.setLocale(Locale.TR.getValue());
        request.setToken(token);
        txByToken.map(PaymentTransaction::getProviderReference).ifPresent(request::setConversationId);

        CheckoutForm checkoutForm = CheckoutForm.retrieve(request, buildOptions());
        log.info(
                "Iyzico callback response status={} paymentStatus={} conversationId={} errorCode={} errorMessage={}",
                checkoutForm.getStatus(),
                checkoutForm.getPaymentStatus(),
                checkoutForm.getConversationId(),
                checkoutForm.getErrorCode(),
                checkoutForm.getErrorMessage()
        );

        PaymentTransaction tx = txByToken.orElseGet(() ->
                paymentTransactionRepository.findByProviderReference(checkoutForm.getConversationId())
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment conversation not found"))
        );

        if (checkoutForm.getPaymentId() != null) {
            tx.setIyzicoPaymentId(checkoutForm.getPaymentId());
        }
        tx.setIyzicoToken(token);

        boolean success = "success".equalsIgnoreCase(checkoutForm.getStatus())
                && "SUCCESS".equalsIgnoreCase(checkoutForm.getPaymentStatus());

        if (success) {
            tx.setStatus(PaymentStatus.SUCCESS);
            paymentTransactionRepository.save(tx);
            orderService.markPaymentSuccessful(tx.getOrder().getId());
            return redirectTo("/payment/success", tx.getOrder().getId());
        }

        log.warn("Iyzico payment failed errorCode={} errorMessage={}", checkoutForm.getErrorCode(), checkoutForm.getErrorMessage());
        tx.setStatus(PaymentStatus.FAILED);
        paymentTransactionRepository.save(tx);
        orderService.markPaymentFailed(tx.getOrder().getId());
        return redirectTo("/payment/fail", tx.getOrder().getId());
    }

    @Transactional
    public IyzicoCallbackResponse callbackFromApi(String conversationId, boolean success) {
        PaymentTransaction tx = paymentTransactionRepository.findByProviderReference(conversationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment conversation not found"));
        if (success) {
            tx.setStatus(PaymentStatus.SUCCESS);
            paymentTransactionRepository.save(tx);
            orderService.markPaymentSuccessful(tx.getOrder().getId());
        } else {
            tx.setStatus(PaymentStatus.FAILED);
            paymentTransactionRepository.save(tx);
            orderService.markPaymentFailed(tx.getOrder().getId());
        }
        Order order = orderService.getEntity(tx.getOrder().getId());
        return new IyzicoCallbackResponse(order.getId(), order.getPaymentStatus().name(), order.getStatus().name());
    }

    private DeliveryDetailsRequest resolveDeliveryForInitiate(Order order, IyzicoInitiateRequest request) {
        OrderDeliveryDetail d = order.getDeliveryDetail();
        if (d != null) {
            return new DeliveryDetailsRequest(
                    Objects.toString(d.getRecipientFirstName(), ""),
                    Objects.toString(d.getRecipientLastName(), ""),
                    Objects.toString(d.getPhoneNumber(), "+905350000000"),
                    d.getAlternativePhoneNumber(),
                    Objects.toString(d.getCity(), "Istanbul"),
                    Objects.toString(d.getDistrict(), "Merkez"),
                    d.getNeighborhood(),
                    Objects.toString(d.getAddressLine(), request.shippingAddress()),
                    d.getBuildingNo(),
                    d.getFloorNo(),
                    d.getApartmentNo(),
                    d.getPostalCode(),
                    d.getDeliveryNote(),
                    d.getIfUnreachableLeaveTo(),
                    d.getAddressTitle()
            );
        }
        return new DeliveryDetailsRequest(
                firstName(order.getUser().getName()),
                lastName(order.getUser().getName()),
                "+905350000000",
                null,
                "Istanbul",
                "Merkez",
                null,
                request.shippingAddress(),
                "",
                "",
                "",
                "",
                "",
                "",
                ""
        );
    }

    private CreateCheckoutFormInitializeRequest buildCheckoutFormInitialize(
            Order order,
            DeliveryDetailsRequest delivery,
            String conversationId,
            String clientIp
    ) {
        CreateCheckoutFormInitializeRequest iyzi = new CreateCheckoutFormInitializeRequest();
        BigDecimal total = money(order.getTotal());

        iyzi.setLocale(Locale.TR.getValue());
        iyzi.setConversationId(conversationId);
        iyzi.setPrice(total);
        iyzi.setPaidPrice(total);
        iyzi.setCurrency(Currency.TRY.name());
        iyzi.setBasketId(String.valueOf(order.getId()));
        iyzi.setPaymentGroup(PaymentGroup.PRODUCT.name());
        iyzi.setCallbackUrl(iyzicoCallbackUrl);
        iyzi.setEnabledInstallments(List.of(1, 2, 3, 6, 9));

        String ip = (clientIp == null || clientIp.isBlank()) ? "127.0.0.1" : clientIp;

        Buyer buyer = new Buyer();
        buyer.setId(String.valueOf(order.getUser().getId()));
        buyer.setName(blankToDefault(delivery.recipientFirstName(), firstName(order.getUser().getName())));
        buyer.setSurname(blankToDefault(delivery.recipientLastName(), lastName(order.getUser().getName())));
        buyer.setGsmNumber(formatGsm(delivery.phoneNumber()));
        buyer.setEmail(order.getUser().getEmail());
        buyer.setIdentityNumber("11111111111");
        buyer.setRegistrationAddress(blankToDefault(delivery.addressLine(), "Adres"));
        buyer.setIp(ip);
        buyer.setCity(blankToDefault(delivery.city(), "Istanbul"));
        buyer.setCountry("Turkey");
        buyer.setZipCode(blankToDefault(delivery.postalCode(), "34000"));
        iyzi.setBuyer(buyer);

        String contactName = (buyer.getName() + " " + buyer.getSurname()).trim();
        String shipAddr = formatStreetAddress(delivery);

        Address shipping = new Address();
        shipping.setContactName(contactName);
        shipping.setCity(buyer.getCity());
        shipping.setCountry("Turkey");
        shipping.setAddress(shipAddr);
        shipping.setZipCode(buyer.getZipCode());
        iyzi.setShippingAddress(shipping);

        Address billing = new Address();
        billing.setContactName(contactName);
        billing.setCity(buyer.getCity());
        billing.setCountry("Turkey");
        billing.setAddress(shipAddr);
        billing.setZipCode(buyer.getZipCode());
        iyzi.setBillingAddress(billing);

        List<BasketItem> items = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            BasketItem basketItem = new BasketItem();
            basketItem.setId(String.valueOf(item.getProduct().getId()));
            basketItem.setName(item.getProduct().getName());
            String categoryName = categoryRepository.findById(item.getProduct().getCategoryId())
                    .map(c -> c.getName())
                    .orElse("Genel");
            basketItem.setCategory1(categoryName);
            basketItem.setItemType(BasketItemType.PHYSICAL.name());
            basketItem.setPrice(money(item.getLineTotal()));
            items.add(basketItem);
        }
        if (items.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Basket items cannot be empty");
        }
        iyzi.setBasketItems(items);
        return iyzi;
    }

    private static String formatStreetAddress(DeliveryDetailsRequest d) {
        return Stream.of(
                        d.addressLine(),
                        d.neighborhood(),
                        d.district(),
                        d.buildingNo() != null ? "No: " + d.buildingNo() : null,
                        d.floorNo() != null ? "Kat: " + d.floorNo() : null,
                        d.apartmentNo() != null ? "Daire: " + d.apartmentNo() : null,
                        d.postalCode(),
                        d.city()
                )
                .filter(s -> s != null && !s.isBlank())
                .reduce((a, b) -> a + ", " + b)
                .orElse(d.addressLine());
    }

    private static String formatGsm(String phone) {
        if (phone == null || phone.isBlank()) {
            return "+905350000000";
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.startsWith("90") && digits.length() >= 12) {
            return "+" + digits;
        }
        if (digits.startsWith("0") && digits.length() >= 11) {
            return "+9" + digits.substring(1);
        }
        if (digits.length() == 10) {
            return "+90" + digits;
        }
        if (digits.length() >= 10) {
            return "+" + digits;
        }
        return "+90" + digits;
    }

    private static String blankToDefault(String v, String def) {
        return (v == null || v.isBlank()) ? def : v;
    }

    private Options buildOptions() {
        Options options = new Options();
        options.setApiKey(iyzicoApiKey);
        options.setSecretKey(iyzicoSecretKey);
        options.setBaseUrl(iyzicoBaseUrl);
        return options;
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "Test";
        return fullName.trim().split("\\s+")[0];
    }

    private String lastName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "User";
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 1 ? parts[parts.length - 1] : "User";
    }

    private ResponseEntity<Void> redirectTo(String path, Long orderId) {
        String location = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path(path)
                .queryParam("orderId", orderId)
                .toUriString();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.LOCATION, location);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
