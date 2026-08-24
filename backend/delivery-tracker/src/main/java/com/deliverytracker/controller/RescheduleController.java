package com.deliverytracker.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.deliverytracker.dto.CreateRescheduleRequest;
import com.deliverytracker.dto.RescheduleResponse;
import com.deliverytracker.service.RescheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class RescheduleController {

    private final RescheduleService rescheduleService;

    @PostMapping("/{orderId}/reschedule")
    public ResponseEntity<RescheduleResponse> createRequest(
            @PathVariable Long orderId,
            @Valid @RequestBody CreateRescheduleRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        rescheduleService.createRequest(
                                orderId,
                                request
                        )
                );
    }

    @GetMapping("/{orderId}/reschedule")
    public ResponseEntity<List<RescheduleResponse>>
    getRequests(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                rescheduleService.getRequestsByOrder(orderId)
        );
    }
}