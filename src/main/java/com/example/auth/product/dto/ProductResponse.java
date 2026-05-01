package com.example.auth.product.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        int stock,
        Long categoryId,
        String categoryName,
        String categorySlug,
        boolean hasDiscount,
        BigDecimal discountPercentage,
        BigDecimal originalPrice,
        BigDecimal discountedPrice,
        BigDecimal finalPrice,
        String mainImageUrl,
        java.util.List<ProductImageResponse> images,
        Instant createdAt,
        Instant updatedAt
) {
}

