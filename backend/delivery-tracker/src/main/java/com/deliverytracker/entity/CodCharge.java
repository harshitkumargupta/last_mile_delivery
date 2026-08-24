package com.deliverytracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cod_charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RateCard.OrderType orderType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal flatCharge;

    @Column(nullable = false, precision = 10, scale = 5)
    private BigDecimal percentageCharge;

    @Column(nullable = false)
    private Boolean active = true;
}