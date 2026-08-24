package com.deliverytracker.dto;

import com.deliverytracker.entity.Order.Status;

import java.time.LocalDateTime;

public record TrackingResponse(

        Long id,

        Long orderId,

        Status status,

        Long actorId,

        String actorName,

        LocalDateTime timestamp,

        String remarks
) {
}