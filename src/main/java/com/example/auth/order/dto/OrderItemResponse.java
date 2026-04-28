package com.example.auth.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        long productId,
        String productName,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal
) {
}

