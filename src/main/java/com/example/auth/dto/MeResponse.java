package com.example.auth.dto;

import java.util.Set;

public record MeResponse(
        Long id,
        String name,
        String email,
        Set<String> roles
) {
}

