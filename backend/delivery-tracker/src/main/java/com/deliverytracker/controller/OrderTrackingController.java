package com.deliverytracker.controller;

import com.deliverytracker.dto.TrackingResponse;
import com.deliverytracker.dto.UpdateOrderStatusRequest;
import com.deliverytracker.service.OrderTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderTrackingController {

    private final OrderTrackingService orderTrackingService;

    /*
     * Only DELIVERY_AGENT and ADMIN can change
     * an order's status.
     */
    @PatchMapping("/{orderId}/tracking")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    public ResponseEntity<TrackingResponse> updateStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                orderTrackingService.updateOrderStatus(
                        orderId,
                        request,
                        authentication.getName()
                )
        );
    }

    /*
     * CUSTOMER, DELIVERY_AGENT and ADMIN can view
     * tracking history.
     */
    @GetMapping("/{orderId}/tracking")
    @PreAuthorize(
            "hasAnyRole('CUSTOMER', 'DELIVERY_AGENT', 'ADMIN')"
    )
    public ResponseEntity<List<TrackingResponse>> getTrackingHistory(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderTrackingService.getTrackingHistory(orderId)
        );
    }
}