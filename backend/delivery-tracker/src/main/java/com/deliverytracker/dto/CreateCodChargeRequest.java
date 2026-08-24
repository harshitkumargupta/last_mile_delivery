package com.deliverytracker.dto;

import com.deliverytracker.entity.RateCard;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateCodChargeRequest(

        @NotNull
        RateCard.OrderType orderType,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal flatCharge,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal percentageCharge
) {
}