package com.example.auth.payment.dto;

public record IyzicoCallbackResponse(
        Long orderId,
        String paymentStatus,
        String orderStatus
) {
}

