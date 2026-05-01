package com.example.auth.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IyzicoInitiateRequest(
        @NotNull Long orderId,
        @NotBlank String shippingAddress,
        @NotBlank String billingAddress
) {
}

