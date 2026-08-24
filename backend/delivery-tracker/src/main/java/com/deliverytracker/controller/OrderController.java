package com.deliverytracker.controller;

import com.deliverytracker.dto.CreateOrderRequest;
import com.deliverytracker.dto.OrderResponse;
import com.deliverytracker.entity.Order;
import com.deliverytracker.entity.User;
import com.deliverytracker.repository.UserRepository;
import com.deliverytracker.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    // =========================================================
    // CUSTOMER - CREATE ORDER
    // =========================================================

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        User customer = getAuthenticatedUser(authentication);

        if (customer.getRole() != User.Role.CUSTOMER) {
            throw new IllegalArgumentException(
                    "Only CUSTOMER accounts can create orders"
            );
        }

        OrderResponse response =
                orderService.createOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // CUSTOMER - GET OWN ORDERS
    // =========================================================

    @GetMapping("/customer")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication) {

        User customer = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                orderService.getCustomerOrders(
                        customer.getId()
                )
        );
    }

    // =========================================================
    // GET CUSTOMER ORDERS BY ID
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getCustomerOrders(
                        customerId
                )
        );
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }

    // =========================================================
    // GET ORDER BY NUMBER
    // =========================================================

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(
            @PathVariable String orderNumber) {

        return ResponseEntity.ok(
                orderService.getOrderByNumber(orderNumber)
        );
    }

    // =========================================================
    // GET ORDERS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(
            @PathVariable Order.Status status) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(status)
        );
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Order.Status status) {

        return ResponseEntity.ok(
                orderService.updateStatus(
                        id,
                        status
                )
        );
    }

    // =========================================================
    // FIND LOGGED-IN USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null) {
            throw new IllegalArgumentException(
                    "Authentication is missing"
            );
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated email is missing"
            );
        }

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Logged-in user not found: " + email
                        )
                );
    }
}