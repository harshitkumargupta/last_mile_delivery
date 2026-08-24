package com.deliverytracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rate_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_zone_id", nullable = false)
    private Zone sourceZone;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_zone_id", nullable = false)
    private Zone destinationZone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private OrderType orderType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal minWeight;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxWeight;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal additionalChargePerKg;

    @Column(nullable = false)
    private Boolean active = true;

    public enum OrderType {
        B2B,
        B2C
    }
}