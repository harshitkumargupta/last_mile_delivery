package com.deliverytracker.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateRescheduleRequest(

        @NotNull
        @Future
        LocalDate requestedDate,

        @Size(max = 500)
        String reason
) {
}