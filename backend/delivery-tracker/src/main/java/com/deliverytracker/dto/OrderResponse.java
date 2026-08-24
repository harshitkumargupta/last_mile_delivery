package com.deliverytracker.dto;

import com.deliverytracker.entity.Order.PaymentType;
import com.deliverytracker.entity.Order.Status;
import com.deliverytracker.entity.RateCard.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(

        Long id,

        String orderNumber,

        Long customerId,

        Long deliveryAgentId,

        String deliveryAgentName,

        String pickupAddress,

        String dropAddress,

        Long pickupZoneId,

        Long dropZoneId,

        BigDecimal length,

        BigDecimal breadth,

        BigDecimal height,

        BigDecimal actualWeight,

        BigDecimal volumetricWeight,

        BigDecimal chargeableWeight,

        OrderType orderType,

        PaymentType paymentType,

        BigDecimal baseCharge,

        BigDecimal codCharge,

        BigDecimal totalCharge,

        Status status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}