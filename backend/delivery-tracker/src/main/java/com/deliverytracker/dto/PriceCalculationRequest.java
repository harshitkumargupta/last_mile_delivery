package com.deliverytracker.dto;

import com.deliverytracker.entity.RateCard;
import com.deliverytracker.entity.Order.PaymentType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record PriceCalculationRequest(

        @NotNull
        Long pickupZoneId,

        @NotNull
        Long dropZoneId,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal length,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal breadth,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal height,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal actualWeight,

        @NotNull
        RateCard.OrderType orderType,

        @NotNull
        PaymentType paymentType
) {
}