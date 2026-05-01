package com.example.auth.product.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminDiscountRequest(
        @NotNull @DecimalMin("1.0") @DecimalMax("90.0") BigDecimal discountPercentage,
        Boolean isActive,
        Instant startDate,
        Instant endDate
) {
}

