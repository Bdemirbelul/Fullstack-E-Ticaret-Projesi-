package com.example.auth.cart.dto;

import jakarta.validation.constraints.Min;

public record UpsertCartItemRequest(
        long productId,
        @Min(1) int quantity
) {
}

