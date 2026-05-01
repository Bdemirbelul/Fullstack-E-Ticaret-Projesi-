package com.example.auth.order.dto;

import com.example.auth.order.entity.OrderStatus;
import com.example.auth.order.entity.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        long id,
        String orderNumber,
        OrderStatus status,
        PaymentStatus paymentStatus,
        @JsonProperty("totalPrice")
        @JsonAlias("total")
        BigDecimal total,
        DeliveryDetailsResponse deliveryDetails,
        List<OrderItemResponse> items,
        Instant createdAt
) {
}

