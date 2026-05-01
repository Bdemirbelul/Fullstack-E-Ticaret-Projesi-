package com.example.auth.favorite.dto;

import java.math.BigDecimal;

public record FavoriteResponseDTO(
        Long productId,
        String name,
        String description,
        BigDecimal originalPrice,
        BigDecimal finalPrice,
        boolean hasDiscount,
        BigDecimal discountPercentage,
        String mainImageUrl,
        String categoryName,
        Integer stock
) {
}

