package com.example.auth.order.service;

import com.example.auth.cart.entity.Cart;
import com.example.auth.cart.entity.CartItem;
import com.example.auth.cart.repository.CartRepository;
import com.example.auth.cart.service.CartService;
import com.example.auth.category.repository.CategoryRepository;
import com.example.auth.entity.User;
import com.example.auth.exception.ApiException;
import com.example.auth.order.dto.AdminOrderItemDTO;
import com.example.auth.order.dto.AdminOrderResponseDTO;
import com.example.auth.order.dto.CheckoutRequest;
import com.example.auth.order.dto.DeliveryDetailsRequest;
import com.example.auth.order.dto.DeliveryDetailsResponse;
import com.example.auth.order.dto.OrderItemResponse;
import com.example.auth.order.dto.OrderResponse;
import com.example.auth.order.entity.Order;
import com.example.auth.order.entity.OrderDeliveryDetail;
import com.example.auth.order.entity.OrderItem;
import com.example.auth.order.entity.OrderStatus;
import com.example.auth.order.entity.PaymentStatus;
import com.example.auth.order.repository.OrderRepository;
import com.example.auth.product.entity.Product;
import com.example.auth.product.entity.ProductImage;
import com.example.auth.product.service.ProductService;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    @Transactional
    public OrderResponse createFromCart(String userEmail, CheckoutRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        DeliveryDetailsRequest deliveryReq = request != null ? request.deliveryDetails() : null;
        if (deliveryReq == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "deliveryDetails is required");
        }

        Cart cart = cartService.getOrCreateCartEntity(userEmail);
        if (cart.getItems().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PREPARING)
                .paymentStatus(PaymentStatus.PAID)
                .orderNumber(generateOrderNumber())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for productId=" + product.getId()
                );
            }

            BigDecimal unitPrice = productService.getFinalUnitPrice(product);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            product.setStock(product.getStock() - cartItem.getQuantity());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();

            order.getItems().add(orderItem);
        }

        order.setSubtotal(subtotal);
        order.setDiscountTotal(BigDecimal.ZERO);
        order.setShippingFee(BigDecimal.ZERO);
        order.setTotal(subtotal);
        order.setDeliveryDetail(toDeliveryDetail(deliveryReq, order));
        Order saved = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Order created from cart orderId={} user={}", saved.getId(), userEmail);

        return toResponse(saved);
    }

    /**
     * Ödeme öncesi: sipariş ve kalemler oluşturulur, stok düşülmez, sepet temizlenmez.
     */
    @Transactional
    public Order createPendingPaymentFromCart(String userEmail, CheckoutRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        DeliveryDetailsRequest deliveryReq = request != null ? request.deliveryDetails() : null;
        if (deliveryReq == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "deliveryDetails is required");
        }

        Cart cart = cartService.getOrCreateCartEntity(userEmail);
        if (cart.getItems().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.PENDING_PAYMENT)
                .orderNumber(generateOrderNumber())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for productId=" + product.getId()
                );
            }

            BigDecimal unitPrice = productService.getFinalUnitPrice(product);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();

            order.getItems().add(orderItem);
        }

        order.setSubtotal(subtotal);
        order.setDiscountTotal(BigDecimal.ZERO);
        order.setShippingFee(BigDecimal.ZERO);
        order.setTotal(subtotal);
        order.setDeliveryDetail(toDeliveryDetail(deliveryReq, order));
        Order saved = orderRepository.save(order);
        log.info("Pending payment order created orderId={} user={}", saved.getId(), userEmail);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listMyOrdersList(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<Order> orders = orderRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId());
        log.debug("listMyOrdersList userId={} count={}", user.getId(), orders.size());
        return orders.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String userEmail, long orderId) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
        if (!order.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
        }
        return toResponse(order);
    }

    /**
     * Müşteri kendi siparişini iptal eder. Stok, ödeme alındıysa ve ürün düşüldüyse geri yüklenir.
     */
    @Transactional
    public OrderResponse cancelMyOrder(String userEmail, long orderId) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
        if (!order.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return toResponse(order);
        }
        if (order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.SHIPPED
                || order.getStatus() == OrderStatus.IN_TRANSIT
                || order.getStatus() == OrderStatus.REFUNDED) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Bu aşamadaki sipariş iptal edilemez. İade için müşteri hizmetleriyle iletişime geçebilirsiniz."
            );
        }
        if (shouldRestoreStockOnCustomerCancel(order)) {
            for (OrderItem item : order.getItems()) {
                Product p = item.getProduct();
                if (p != null) {
                    p.setStock(p.getStock() + item.getQuantity());
                }
            }
        }
        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        } else if (order.getPaymentStatus() != PaymentStatus.REFUNDED) {
            order.setPaymentStatus(PaymentStatus.FAILED);
        }
        Order saved = orderRepository.save(order);
        log.info("Customer cancelled order orderId={} user={}", orderId, userEmail);
        return toResponse(saved);
    }

    private boolean shouldRestoreStockOnCustomerCancel(Order order) {
        OrderStatus s = order.getStatus();
        return s == OrderStatus.PREPARING || s == OrderStatus.PAID || s == OrderStatus.CREATED;
    }

    @Transactional
    public OrderResponse updateStatus(long orderId, OrderStatus status) {
        Order order = getEntity(orderId);
        order.setStatus(status);
        if (status == OrderStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.PAID);
        } else if (status == OrderStatus.REFUNDED) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        } else if (status == OrderStatus.CANCELLED && order.getPaymentStatus() == null) {
            order.setPaymentStatus(PaymentStatus.PENDING_PAYMENT);
        }
        Order saved = orderRepository.save(order);
        log.info("Order status updated orderId={} status={}", orderId, status);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponseDTO> listAdminOrders(
            String search,
            OrderStatus status,
            PaymentStatus paymentStatus,
            Instant from,
            Instant to
    ) {
        return orderRepository.findAll().stream()
                .filter(order -> matchesFilter(order, search, status, paymentStatus, from, to))
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminOrderResponseDTO getAdminOrder(long orderId) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found: " + orderId));
        return toAdminResponse(order);
    }

    @Transactional
    public AdminOrderResponseDTO updateAdminStatus(long orderId, OrderStatus status) {
        updateStatus(orderId, status);
        return getAdminOrder(orderId);
    }

    @Transactional
    public void cancelOrder(long orderId) {
        Order order = getEntity(orderId);
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional
    public void markPaymentSuccessful(long orderId) {
        Order order = getEntity(orderId);
        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new ApiException(HttpStatus.CONFLICT, "Insufficient stock for productId=" + product.getId());
            }
            product.setStock(product.getStock() - item.getQuantity());
        }
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        String email = order.getUser() != null ? order.getUser().getEmail() : null;
        if (email != null) {
            cartService.clear(email);
        }
    }

    @Transactional
    public void markPaymentFailed(long orderId) {
        Order order = getEntity(orderId);
        order.setPaymentStatus(PaymentStatus.FAILED);
        order.setStatus(OrderStatus.PAYMENT_FAILED);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getEntity(long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found: " + id));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItem> rawItems = order.getItems() != null ? order.getItems() : List.of();
        List<OrderItemResponse> items = rawItems.stream()
                .map(i -> {
                    Product p = i.getProduct();
                    long pid = p != null && p.getId() != null ? p.getId() : 0L;
                    String name = p != null && p.getName() != null ? p.getName() : "";
                    BigDecimal unit = i.getUnitPrice() != null ? i.getUnitPrice() : BigDecimal.ZERO;
                    BigDecimal line = i.getLineTotal() != null ? i.getLineTotal() : BigDecimal.ZERO;
                    return new OrderItemResponse(
                            pid,
                            name,
                            unit,
                            i.getQuantity(),
                            line,
                            p != null ? resolveImageUrl(p) : null
                    );
                })
                .toList();

        BigDecimal total = order.getTotal() != null ? order.getTotal() : BigDecimal.ZERO;
        DeliveryDetailsResponse deliveryDetails = toDeliveryResponse(order.getDeliveryDetail());

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getPaymentStatus() != null ? order.getPaymentStatus() : PaymentStatus.PENDING_PAYMENT,
                total,
                deliveryDetails,
                items,
                order.getCreatedAt()
        );
    }

    private OrderDeliveryDetail toDeliveryDetail(DeliveryDetailsRequest req, Order order) {
        return OrderDeliveryDetail.builder()
                .order(order)
                .recipientFirstName(req.recipientFirstName())
                .recipientLastName(req.recipientLastName())
                .phoneNumber(req.phoneNumber())
                .alternativePhoneNumber(req.alternativePhoneNumber())
                .city(req.city())
                .district(req.district())
                .neighborhood(req.neighborhood())
                .addressLine(req.addressLine())
                .buildingNo(req.buildingNo())
                .floorNo(req.floorNo())
                .apartmentNo(req.apartmentNo())
                .postalCode(req.postalCode())
                .deliveryNote(req.deliveryNote())
                .ifUnreachableLeaveTo(req.ifUnreachableLeaveTo())
                .addressTitle(req.addressTitle())
                .build();
    }

    private DeliveryDetailsResponse toDeliveryResponse(OrderDeliveryDetail d) {
        if (d == null) return null;
        return new DeliveryDetailsResponse(
                d.getRecipientFirstName(),
                d.getRecipientLastName(),
                d.getPhoneNumber(),
                d.getAlternativePhoneNumber(),
                d.getCity(),
                d.getDistrict(),
                d.getNeighborhood(),
                d.getAddressLine(),
                d.getBuildingNo(),
                d.getFloorNo(),
                d.getApartmentNo(),
                d.getPostalCode(),
                d.getDeliveryNote(),
                d.getIfUnreachableLeaveTo(),
                d.getAddressTitle()
        );
    }

    private AdminOrderResponseDTO toAdminResponse(Order order) {
        User user = order.getUser();
        long userId = user != null && user.getId() != null ? user.getId() : 0L;
        String customerName = user != null && user.getName() != null ? user.getName() : "(Silinmiş kullanıcı)";
        String customerEmail = user != null && user.getEmail() != null ? user.getEmail() : "-";
        List<OrderItem> rawItems = order.getItems() != null ? order.getItems() : List.of();
        List<AdminOrderItemDTO> items = rawItems.stream()
                .map(item -> {
                    Product p = item.getProduct();
                    long productId = p != null && p.getId() != null ? p.getId() : 0L;
                    String productName = p != null && p.getName() != null ? p.getName() : "(Silinmiş ürün)";
                    BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                    BigDecimal lineTotal = item.getLineTotal() != null ? item.getLineTotal() : BigDecimal.ZERO;
                    return new AdminOrderItemDTO(
                            productId,
                            productName,
                            p != null ? resolveCategoryName(p.getCategoryId()) : null,
                            p != null ? resolveImageUrl(p) : null,
                            item.getQuantity(),
                            unitPrice,
                            unitPrice,
                            lineTotal,
                            item.getSelectedSize(),
                            item.getSelectedShoeSize(),
                            item.getSelectedColor()
                    );
                })
                .toList();

        return new AdminOrderResponseDTO(
                order.getId(),
                order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId(),
                userId,
                customerName,
                customerEmail,
                order.getStatus(),
                statusLabel(order.getStatus()),
                order.getPaymentStatus() != null ? order.getPaymentStatus() : PaymentStatus.PENDING_PAYMENT,
                order.getTotal(),
                order.getSubtotal() != null ? order.getSubtotal() : order.getTotal(),
                order.getDiscountTotal() != null ? order.getDiscountTotal() : BigDecimal.ZERO,
                order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO,
                items.stream().mapToInt(AdminOrderItemDTO::quantity).sum(),
                order.getCreatedAt(),
                order.getUpdatedAt() != null ? order.getUpdatedAt() : order.getCreatedAt(),
                items
        );
    }

    private boolean matchesFilter(
            Order order,
            String search,
            OrderStatus status,
            PaymentStatus paymentStatus,
            Instant from,
            Instant to
    ) {
        if (status != null && order.getStatus() != status) return false;
        if (paymentStatus != null && order.getPaymentStatus() != paymentStatus) return false;
        if (from != null && order.getCreatedAt() != null && order.getCreatedAt().isBefore(from)) return false;
        if (to != null && order.getCreatedAt() != null && order.getCreatedAt().isAfter(to)) return false;
        if (search == null || search.isBlank()) return true;
        String q = search.toLowerCase();
        User user = order.getUser();
        String userName = user != null ? user.getName() : null;
        String userEmail = user != null ? user.getEmail() : null;
        return (order.getOrderNumber() != null && order.getOrderNumber().toLowerCase().contains(q))
                || (userName != null && userName.toLowerCase().contains(q))
                || (userEmail != null && userEmail.toLowerCase().contains(q))
                || String.valueOf(order.getId()).contains(q);
    }

    private String resolveImageUrl(Product product) {
        if (product == null) {
            return null;
        }
        try {
            if (product.getImages() == null || product.getImages().isEmpty()) {
                return null;
            }
            return product.getImages().stream()
                    .filter(img -> img != null && img.getImageUrl() != null && !img.getImageUrl().isBlank())
                    .sorted(Comparator.comparing(ProductImage::isMain).reversed())
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(null);
        } catch (Exception e) {
            log.warn("resolveImageUrl failed for productId={}: {}", product.getId(), e.getMessage());
            return null;
        }
    }

    private String resolveCategoryName(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId).map(c -> c.getName()).orElse(null);
    }

    private String statusLabel(OrderStatus status) {
        if (status == null) return "";
        return switch (status) {
            case PENDING_PAYMENT -> "Odeme Bekliyor";
            case PAYMENT_FAILED -> "Odeme Basarisiz";
            case PAID -> "Odendi";
            case PREPARING -> "Hazirlaniyor";
            case SHIPPED -> "Kargoya Verildi";
            case IN_TRANSIT -> "Kargoda";
            case DELIVERED -> "Teslim Edildi";
            case CANCELLED -> "Iptal Edildi";
            case REFUNDED -> "Iade Edildi";
            case CREATED -> "Olusturuldu";
        };
    }

    private String generateOrderNumber() {
        String day = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String rand = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + day + "-" + rand;
    }
}

