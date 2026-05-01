package com.example.auth.product.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminDiscountResponse(
        Long id,
        BigDecimal discountPercentage,
        boolean isActive,
        Instant startDate,
        Instant endDate
) {
}

