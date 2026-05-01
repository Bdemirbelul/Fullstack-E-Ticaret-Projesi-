package com.example.auth.payment.dto;

public record IyzicoCheckoutResponse(
        Long orderId,
        String checkoutFormContent,
        String paymentPageUrl,
        String token
) {
}
