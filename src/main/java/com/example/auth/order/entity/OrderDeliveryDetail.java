package com.example.auth.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "order_delivery_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDeliveryDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false, length = 120)
    private String recipientFirstName;

    @Column(nullable = false, length = 120)
    private String recipientLastName;

    @Column(nullable = false, length = 32)
    private String phoneNumber;

    @Column(length = 32)
    private String alternativePhoneNumber;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 120)
    private String district;

    @Column(length = 120)
    private String neighborhood;

    @Column(nullable = false, length = 1000)
    private String addressLine;

    @Column(length = 32)
    private String buildingNo;

    @Column(length = 32)
    private String floorNo;

    @Column(length = 32)
    private String apartmentNo;

    @Column(length = 32)
    private String postalCode;

    @Column(length = 1000)
    private String deliveryNote;

    @Column(length = 255)
    private String ifUnreachableLeaveTo;

    @Column(length = 120)
    private String addressTitle;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
