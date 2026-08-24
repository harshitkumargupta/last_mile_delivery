package com.deliverytracker.controller;

import com.deliverytracker.dto.CreateDeliveryAgentRequest;
import com.deliverytracker.dto.DeliveryAgentResponse;
import com.deliverytracker.dto.UpdateAgentAvailabilityRequest;
import com.deliverytracker.dto.UpdateAgentLocationRequest;
import com.deliverytracker.service.DeliveryAgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-agents")
@RequiredArgsConstructor
public class DeliveryAgentController {

    private final DeliveryAgentService deliveryAgentService;

    // =========================================================
    // ADMIN ONLY
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryAgentResponse> createAgent(
            @Valid @RequestBody CreateDeliveryAgentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        deliveryAgentService.createAgent(request)
                );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryAgentResponse> getAgent(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                deliveryAgentService.getAgentById(id)
        );
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DeliveryAgentResponse>>
    getAvailableAgents() {

        return ResponseEntity.ok(
                deliveryAgentService.getAvailableAgents()
        );
    }

    @GetMapping("/available/zone/{zoneId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DeliveryAgentResponse>>
    getAvailableAgentsByZone(
            @PathVariable Long zoneId) {

        return ResponseEntity.ok(
                deliveryAgentService
                        .getAvailableAgentsByZone(zoneId)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateAgent(
            @PathVariable Long id) {

        deliveryAgentService.deactivateAgent(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // ADMIN + DELIVERY AGENT
    // =========================================================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAgentResponse> getAgentByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                deliveryAgentService.getAgentByUserId(userId)
        );
    }

    @PatchMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAgentResponse> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateAgentLocationRequest request) {

        return ResponseEntity.ok(
                deliveryAgentService.updateLocation(
                        id,
                        request
                )
        );
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_AGENT')")
    public ResponseEntity<DeliveryAgentResponse>
    updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateAgentAvailabilityRequest request) {

        return ResponseEntity.ok(
                deliveryAgentService.updateAvailability(
                        id,
                        request
                )
        );
    }
}