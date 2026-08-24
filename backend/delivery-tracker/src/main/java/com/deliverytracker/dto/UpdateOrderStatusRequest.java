package com.deliverytracker.dto;

import com.deliverytracker.entity.Order.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(

        @NotNull
        Status status,

        String remarks
) {
}