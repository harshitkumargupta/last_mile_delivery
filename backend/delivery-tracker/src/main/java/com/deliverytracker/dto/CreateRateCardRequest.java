package com.deliverytracker.dto;

import com.deliverytracker.entity.RateCard;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateRateCardRequest(

        @NotNull
        Long sourceZoneId,

        @NotNull
        Long destinationZoneId,

        @NotNull
        RateCard.OrderType orderType,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal minWeight,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal maxWeight,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal baseCharge,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal additionalChargePerKg
) {
}