package com.deliverytracker.dto;

import java.math.BigDecimal;

public record DeliveryAgentResponse(

        Long id,

        Long userId,

        String name,

        String email,

        String phone,

        Boolean available,

        BigDecimal latitude,

        BigDecimal longitude,

        Long currentZoneId,

        String currentZoneName,

        Boolean active
) {
}