package com.deliverytracker.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RescheduleResponse(

        Long id,

        Long orderId,

        String orderNumber,

        LocalDate requestedDate,

        String reason,

        LocalDateTime requestedAt
) {
}