package com.example.auth.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull(message = "deliveryDetails is required")
        @Valid
        DeliveryDetailsRequest deliveryDetails
) {
}
