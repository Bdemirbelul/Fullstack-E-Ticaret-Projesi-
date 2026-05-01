package com.example.auth.order.dto;

import com.example.auth.order.entity.OrderStatus;
import com.example.auth.order.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminOrderResponseDTO(
        Long id,
        String orderNumber,
        Long userId,
        String customerName,
        String customerEmail,
        OrderStatus status,
        String statusLabel,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        BigDecimal subtotal,
        BigDecimal discountTotal,
        BigDecimal shippingFee,
        int itemCount,
        Instant createdAt,
        Instant updatedAt,
        List<AdminOrderItemDTO> items
) {
}

