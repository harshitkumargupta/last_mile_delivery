package com.deliverytracker.dto;

import jakarta.validation.constraints.NotNull;

public record CreateDeliveryAgentRequest(

        @NotNull
        Long userId
) {
}