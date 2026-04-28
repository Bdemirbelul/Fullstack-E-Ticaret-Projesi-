package com.example.auth.payment.dto;

import com.example.auth.payment.entity.PaymentProvider;
import com.example.auth.payment.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        long transactionId,
        long orderId,
        PaymentProvider provider,
        PaymentStatus status,
        BigDecimal amount,
        String providerReference,
        Instant createdAt
) {
}

