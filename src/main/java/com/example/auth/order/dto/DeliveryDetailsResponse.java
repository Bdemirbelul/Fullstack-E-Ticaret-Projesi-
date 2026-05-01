package com.example.auth.order.dto;

public record DeliveryDetailsResponse(
        String recipientFirstName,
        String recipientLastName,
        String phoneNumber,
        String alternativePhoneNumber,
        String city,
        String district,
        String neighborhood,
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
