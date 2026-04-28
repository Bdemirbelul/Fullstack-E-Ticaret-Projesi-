package com.example.auth.cart.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        long productId,
        String productName,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal
) {
}

