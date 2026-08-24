package com.deliverytracker.service;

import com.deliverytracker.dto.TrackingResponse;
import com.deliverytracker.dto.UpdateOrderStatusRequest;
import com.deliverytracker.entity.DeliveryAgent;
import com.deliverytracker.entity.Order;
import com.deliverytracker.entity.OrderAssignment;
import com.deliverytracker.entity.OrderTrackingHistory;
import com.deliverytracker.entity.User;
import com.deliverytracker.repository.DeliveryAgentRepository;
import com.deliverytracker.repository.OrderAssignmentRepository;
import com.deliverytracker.repository.OrderRepository;
import com.deliverytracker.repository.OrderTrackingHistoryRepository;
import com.deliverytracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderTrackingService {

    private final OrderRepository orderRepository;
    private final OrderTrackingHistoryRepository trackingRepository;
    private final UserRepository userRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final OrderAssignmentRepository assignmentRepository;

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @Transactional
    public TrackingResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request,
            String email) {

        // -----------------------------------------------------
        // 1. FIND ORDER
        // -----------------------------------------------------

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found with id: " + orderId
                        )
                );

        // -----------------------------------------------------
        // 2. FIND LOGGED-IN USER
        // -----------------------------------------------------

        User actor = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Logged-in user not found"
                        )
                );

        // -----------------------------------------------------
        // 3. VALIDATE ACTIVE ACCOUNT
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(actor.getActive())) {
            throw new IllegalArgumentException(
                    "User account is inactive"
            );
        }

        // -----------------------------------------------------
        // 4. DELIVERY AGENT AUTHORIZATION
        // -----------------------------------------------------

        DeliveryAgent agent = null;
        OrderAssignment assignment = null;

        if (actor.getRole() == User.Role.DELIVERY_AGENT) {

            agent = deliveryAgentRepository
                    .findByUserId(actor.getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Delivery agent profile not found"
                            )
                    );

            if (!Boolean.TRUE.equals(agent.getActive())) {
                throw new IllegalArgumentException(
                        "Delivery agent is inactive"
                );
            }

            assignment = assignmentRepository
                    .findByOrderId(orderId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "This order is not assigned to any delivery agent"
                            )
                    );

            if (assignment.getUnassignedAt() != null) {
                throw new IllegalArgumentException(
                        "This order has already been completed or unassigned"
                );
            }

            if (!assignment.getAgent().getId()
                    .equals(agent.getId())) {

                throw new IllegalArgumentException(
                        "This order is not assigned to you"
                );
            }
        }

        // -----------------------------------------------------
        // 5. ONLY AGENT / ADMIN CAN UPDATE STATUS
        // -----------------------------------------------------

        if (actor.getRole() != User.Role.DELIVERY_AGENT
                && actor.getRole() != User.Role.ADMIN) {

            throw new IllegalArgumentException(
                    "You are not authorized to update order status"
            );
        }

        // -----------------------------------------------------
        // 6. VALIDATE STATUS TRANSITION
        // -----------------------------------------------------

        validateStatusTransition(
                order.getStatus(),
                request.status()
        );

        // -----------------------------------------------------
        // 7. UPDATE ORDER STATUS
        // -----------------------------------------------------

        order.setStatus(request.status());

        orderRepository.save(order);

        // -----------------------------------------------------
        // 8. RELEASE DELIVERY AGENT
        // -----------------------------------------------------

        if (request.status() == Order.Status.DELIVERED
                || request.status() == Order.Status.FAILED
                || request.status() == Order.Status.RESCHEDULED) {

            OrderAssignment deliveryAssignment =
                    assignment != null
                            ? assignment
                            : assignmentRepository
                                    .findByOrderId(orderId)
                                    .orElse(null);

            if (deliveryAssignment != null
                    && deliveryAssignment.getUnassignedAt() == null) {

                // Close current assignment
                deliveryAssignment.setUnassignedAt(
                        LocalDateTime.now()
                );

                assignmentRepository.save(
                        deliveryAssignment
                );

                // Make agent available again
                DeliveryAgent assignedAgent =
                        deliveryAssignment.getAgent();

                if (assignedAgent != null) {

                    assignedAgent.setAvailable(true);

                    deliveryAgentRepository.save(
                            assignedAgent
                    );
                }
            }

            // Clear delivery agent from order
            order.setDeliveryAgent(null);

            orderRepository.save(order);
        }

        // -----------------------------------------------------
        // 9. CREATE TRACKING HISTORY
        // -----------------------------------------------------

        OrderTrackingHistory history =
                OrderTrackingHistory.builder()
                        .order(order)
                        .status(request.status())
                        .actor(actor)
                        .remarks(request.remarks())
                        .build();

        OrderTrackingHistory saved =
                trackingRepository.save(history);

        // -----------------------------------------------------
        // 10. RETURN RESPONSE
        // -----------------------------------------------------

        return toResponse(saved);
    }

    // =========================================================
    // GET TRACKING HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<TrackingResponse> getTrackingHistory(
            Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new IllegalArgumentException(
                    "Order not found with id: " + orderId
            );
        }

        return trackingRepository
                .findByOrderIdOrderByTimestampAsc(orderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // STATUS TRANSITIONS
    // =========================================================

    private void validateStatusTransition(
            Order.Status current,
            Order.Status next) {

        if (current == next) {
            throw new IllegalArgumentException(
                    "Order is already in status " + current
            );
        }

        boolean valid = switch (current) {

            case CREATED ->
                    next == Order.Status.PICKED_UP
                            || next == Order.Status.FAILED
                            || next == Order.Status.RESCHEDULED;

            case PICKED_UP ->
                    next == Order.Status.IN_TRANSIT
                            || next == Order.Status.FAILED
                            || next == Order.Status.RESCHEDULED;

            case IN_TRANSIT ->
                    next == Order.Status.OUT_FOR_DELIVERY
                            || next == Order.Status.FAILED
                            || next == Order.Status.RESCHEDULED;

            case OUT_FOR_DELIVERY ->
                    next == Order.Status.DELIVERED
                            || next == Order.Status.FAILED
                            || next == Order.Status.RESCHEDULED;

            case RESCHEDULED ->
                    next == Order.Status.PICKED_UP
                            || next == Order.Status.FAILED;

            case DELIVERED, FAILED ->
                    false;
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid status transition from "
                            + current
                            + " to "
                            + next
            );
        }
    }

    // =========================================================
    // RESPONSE MAPPING
    // =========================================================

    private TrackingResponse toResponse(
            OrderTrackingHistory history) {

        return new TrackingResponse(
                history.getId(),
                history.getOrder().getId(),
                history.getStatus(),
                history.getActor().getId(),
                history.getActor().getFullName(),
                history.getTimestamp(),
                history.getRemarks()
        );
    }
}