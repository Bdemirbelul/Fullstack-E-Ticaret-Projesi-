package com.example.auth.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record IyzicoCallbackRequest(
        @NotBlank String conversationId,
        boolean success
) {
}

