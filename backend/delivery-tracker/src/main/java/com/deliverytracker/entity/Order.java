package com.deliverytracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String orderNumber;

    // CUSTOMER
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // DELIVERY AGENT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_agent_id")
    private User deliveryAgent;

    @Column(nullable = false, length = 500)
    private String pickupAddress;

    @Column(nullable = false, length = 500)
    private String dropAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_zone_id")
    private Zone pickupZone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_zone_id")
    private Zone dropZone;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal length;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal breadth;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal height;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal actualWeight;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal volumetricWeight;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal chargeableWeight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RateCard.OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PaymentType paymentType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal baseCharge;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal codCharge;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCharge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PaymentType {
        PREPAID,
        COD
    }

    public enum Status {
        CREATED,
        PICKED_UP,
        IN_TRANSIT,
        OUT_FOR_DELIVERY,
        DELIVERED,
        FAILED,
        RESCHEDULED
    }
}