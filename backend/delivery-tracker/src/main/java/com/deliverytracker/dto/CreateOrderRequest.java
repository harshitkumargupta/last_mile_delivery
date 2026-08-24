package com.deliverytracker.dto;

import com.deliverytracker.entity.Order.PaymentType;
import com.deliverytracker.entity.RateCard.OrderType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateOrderRequest(

        @NotNull
        Long customerId,

        @NotBlank
        String pickupAddress,

        @NotBlank
        String dropAddress,

        @NotNull
        Long pickupZoneId,

        @NotNull
        Long dropZoneId,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal length,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal breadth,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal height,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal actualWeight,

        @NotNull
        OrderType orderType,

        @NotNull
        PaymentType paymentType
) {
}