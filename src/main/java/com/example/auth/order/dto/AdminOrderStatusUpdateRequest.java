package com.example.auth.order.dto;

import com.example.auth.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record AdminOrderStatusUpdateRequest(
        @NotNull OrderStatus status
) {
}

