package com.example.auth.order.entity;

public enum OrderStatus {
    CREATED,
    PENDING_PAYMENT,
    PAYMENT_FAILED,
    PAID,
    PREPARING,
    SHIPPED,
    IN_TRANSIT,
    DELIVERED,
    CANCELLED,
    REFUNDED
}

