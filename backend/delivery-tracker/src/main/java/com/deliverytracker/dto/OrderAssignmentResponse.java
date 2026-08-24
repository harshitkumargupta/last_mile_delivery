package com.deliverytracker.dto;

import com.deliverytracker.entity.OrderAssignment.AssignmentType;

import java.time.LocalDateTime;

public record OrderAssignmentResponse(

        Long id,

        Long orderId,

        String orderNumber,

        Long agentId,

        Long agentUserId,

        String agentName,

        AssignmentType assignmentType,

        LocalDateTime assignedAt,

        LocalDateTime unassignedAt
) {
}