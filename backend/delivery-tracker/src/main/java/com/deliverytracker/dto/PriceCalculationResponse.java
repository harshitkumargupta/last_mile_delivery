package com.deliverytracker.dto;

import java.math.BigDecimal;

public record PriceCalculationResponse(

        BigDecimal volumetricWeight,

        BigDecimal chargeableWeight,

        BigDecimal baseCharge,

        BigDecimal codCharge,

        BigDecimal totalCharge
) {
}