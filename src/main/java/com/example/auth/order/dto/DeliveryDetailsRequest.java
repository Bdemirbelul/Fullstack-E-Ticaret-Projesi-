package com.example.auth.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeliveryDetailsRequest(
        @NotBlank(message = "recipientFirstName is required")
        String recipientFirstName,
        @NotBlank(message = "recipientLastName is required")
        String recipientLastName,
        @NotBlank(message = "phoneNumber is required")
        @Size(min = 10, message = "phoneNumber must be at least 10 characters")
        String phoneNumber,
        String alternativePhoneNumber,
        @NotBlank(message = "city is required")
        String city,
        @NotBlank(message = "district is required")
        String district,
        String neighborhood,
        @NotBlank(message = "addressLine is required")
        String addressLine,
        String buildingNo,
        String floorNo,
        String apartmentNo,
        String postalCode,
        String deliveryNote,
        String ifUnreachableLeaveTo,
        String addressTitle
) {
}
