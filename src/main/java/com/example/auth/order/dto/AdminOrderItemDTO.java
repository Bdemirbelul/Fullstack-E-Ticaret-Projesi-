package com.example.auth.order.dto;

import java.math.BigDecimal;

public record AdminOrderItemDTO(
        Long productId,
        String productName,
        String categoryName,
        String imageUrl,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal finalPrice,
        BigDecimal totalPrice,
        String selectedSize,
        String selectedShoeSize,
        String selectedColor
) {
}

