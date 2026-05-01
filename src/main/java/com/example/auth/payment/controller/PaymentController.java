package com.example.auth.payment.controller;

import com.example.auth.common.security.CurrentUser;
import com.example.auth.order.dto.CheckoutRequest;
import com.example.auth.payment.dto.IyzicoCallbackRequest;
import com.example.auth.payment.dto.IyzicoCallbackResponse;
import com.example.auth.payment.dto.IyzicoCheckoutResponse;
import com.example.auth.payment.dto.IyzicoInitiateRequest;
import com.example.auth.payment.dto.IyzicoInitiateResponse;
import com.example.auth.payment.dto.PaymentResponse;
import com.example.auth.payment.service.IyzicoPaymentService;
import com.example.auth.payment.service.MockIyzicoPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/payments/iyzico", "/payments/iyzico"})
@RequiredArgsConstructor
public class PaymentController {

    private final MockIyzicoPaymentService mockIyzicoPaymentService;
    private final IyzicoPaymentService iyzicoPaymentService;

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/pay/{orderId}")
    public ResponseEntity<PaymentResponse> pay(@PathVariable long orderId,
                                               @RequestParam(defaultValue = "true") boolean succeed) {
        return ResponseEntity.ok(mockIyzicoPaymentService.pay(orderId, succeed));
    }

    /**
     * Sepet + teslimat ile siparişi PENDING_PAYMENT oluşturur ve iyzico ödeme formunu başlatır.
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/checkout")
    public ResponseEntity<IyzicoCheckoutResponse> checkout(@Valid @RequestBody CheckoutRequest request,
                                                         HttpServletRequest httpRequest) {
        String clientIp = resolveClientIp(httpRequest);
        return ResponseEntity.ok(iyzicoPaymentService.checkoutFromCart(CurrentUser.email(), request, clientIp));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/initiate")
    public ResponseEntity<IyzicoInitiateResponse> initiate(@Valid @RequestBody IyzicoInitiateRequest request) {
        return ResponseEntity.ok(iyzicoPaymentService.initiate(CurrentUser.email(), request));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> callback(@RequestParam(required = false) String token, HttpServletRequest servletRequest) {
        if (token == null || token.isBlank()) {
            token = servletRequest.getParameter("token");
        }
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing iyzico token"));
        }
        return iyzicoPaymentService.handleProviderCallback(token);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/callback/manual")
    public ResponseEntity<IyzicoCallbackResponse> callbackManual(@Valid @RequestBody IyzicoCallbackRequest request) {
        return ResponseEntity.ok(iyzicoPaymentService.callbackFromApi(request.conversationId(), request.success()));
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
