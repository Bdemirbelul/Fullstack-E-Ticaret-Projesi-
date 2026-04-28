package com.example.auth.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        long cartId,
        List<CartItemResponse> items,
        BigDecimal total
) {
}

