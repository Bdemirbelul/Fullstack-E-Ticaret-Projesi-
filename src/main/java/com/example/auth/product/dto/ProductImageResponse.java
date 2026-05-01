package com.example.auth.product.dto;

public record ProductImageResponse(
        Long id,
        String imageUrl,
        boolean isMain
) {
}
