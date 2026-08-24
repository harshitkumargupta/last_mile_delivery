package com.deliverytracker.dto;

import com.deliverytracker.entity.OrderAssignment.AssignmentType;
import jakarta.validation.constraints.NotNull;

public record CreateAssignmentRequest(

        @NotNull
        Long orderId,

        @NotNull
        Long agentId,

        @NotNull
        AssignmentType assignmentType
) {
}