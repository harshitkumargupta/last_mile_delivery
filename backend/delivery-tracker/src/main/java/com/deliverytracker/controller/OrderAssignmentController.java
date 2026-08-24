package com.deliverytracker.controller;

import com.deliverytracker.dto.CreateAssignmentRequest;
import com.deliverytracker.dto.OrderAssignmentResponse;
import com.deliverytracker.service.OrderAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class OrderAssignmentController {

    private final OrderAssignmentService assignmentService;

    // =========================================================
    // ADMIN - MANUAL ASSIGNMENT
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderAssignmentResponse> assignOrder(
            @Valid @RequestBody CreateAssignmentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        assignmentService.assignOrder(request)
                );
    }

    // =========================================================
    // ADMIN - AUTOMATIC ASSIGNMENT
    // =========================================================

    @PostMapping("/auto/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderAssignmentResponse> autoAssignOrder(
            @PathVariable Long orderId) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        assignmentService.autoAssignOrder(orderId)
                );
    }

    // =========================================================
    // ADMIN - GET ORDER ASSIGNMENT
    // =========================================================

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderAssignmentResponse>
    getOrderAssignment(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentByOrder(orderId)
        );
    }

    // =========================================================
    // ADMIN / DELIVERY AGENT - GET AGENT ASSIGNMENTS
    // =========================================================

    @GetMapping("/agent/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_AGENT')")
    public ResponseEntity<List<OrderAssignmentResponse>>
    getAgentAssignments(
            @PathVariable Long agentId) {

        return ResponseEntity.ok(
                assignmentService.getAgentAssignments(agentId)
        );
    }

    // =========================================================
    // ADMIN - UNASSIGN ORDER
    // =========================================================

    @DeleteMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderAssignmentResponse>
    unassignOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                assignmentService.unassignOrder(orderId)
        );
    }
}