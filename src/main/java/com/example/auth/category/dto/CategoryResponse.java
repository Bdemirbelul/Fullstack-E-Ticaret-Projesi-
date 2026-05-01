package com.example.auth.category.dto;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        Long parentId
) {
}
