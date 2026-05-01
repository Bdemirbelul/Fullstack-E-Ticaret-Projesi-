package com.example.auth.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record OrderItemResponse(
        long productId,
        String productName,
        BigDecimal unitPrice,
        int quantity,
        @JsonProperty("totalPrice")
        BigDecimal lineTotal,
        String imageUrl
) {
    public OrderItemResponse(long productId, String productName, BigDecimal unitPrice, int quantity, BigDecimal lineTotal) {
        this(productId, productName, unitPrice, quantity, lineTotal, null);
    }
}
