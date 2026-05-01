package com.example.auth.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminProductImageRequest(
        @NotBlank @Size(max = 1200) String imageUrl,
        Boolean isMain
) {
}

