package com.example.auth.payment.dto;

public record IyzicoInitiateResponse(
        Long transactionId,
        Long orderId,
        String paymentPageUrl,
        String conversationId,
        String checkoutFormContent,
        String token
) {
}

