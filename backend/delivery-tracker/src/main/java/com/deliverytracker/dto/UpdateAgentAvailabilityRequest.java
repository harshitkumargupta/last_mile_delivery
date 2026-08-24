package com.deliverytracker.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateAgentAvailabilityRequest(

        @NotNull
        Boolean available
) {
}