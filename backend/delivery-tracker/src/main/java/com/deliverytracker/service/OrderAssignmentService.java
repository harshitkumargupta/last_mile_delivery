package com.deliverytracker.service;

import com.deliverytracker.dto.CreateAssignmentRequest;
import com.deliverytracker.dto.OrderAssignmentResponse;
import com.deliverytracker.entity.DeliveryAgent;
import com.deliverytracker.entity.Order;
import com.deliverytracker.entity.OrderAssignment;
import com.deliverytracker.repository.DeliveryAgentRepository;
import com.deliverytracker.repository.OrderAssignmentRepository;
import com.deliverytracker.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderAssignmentService {

    private final OrderAssignmentRepository assignmentRepository;
    private final OrderRepository orderRepository;
    private final DeliveryAgentRepository agentRepository;

    // =========================================================
    // MANUAL ASSIGNMENT
    // =========================================================

    @Transactional
    public OrderAssignmentResponse assignOrder(
            CreateAssignmentRequest request) {

        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found with id: " + request.orderId()
                        )
                );

        DeliveryAgent agent = agentRepository.findById(request.agentId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Delivery agent not found with id: "
                                        + request.agentId()
                        )
                );

        validateOrder(order);
        validateAgent(agent);

        // Check for an active assignment.
        if (assignmentRepository
                .existsByOrderIdAndUnassignedAtIsNull(order.getId())) {

            throw new IllegalArgumentException(
                    "Order is already assigned to a delivery agent"
            );
        }

        /*
         * Because order_id is UNIQUE in order_assignments,
         * reuse an old inactive assignment instead of inserting
         * another row.
         */
        OrderAssignment assignment =
                assignmentRepository.findByOrderId(order.getId())
                        .orElse(null);

        if (assignment == null) {

            assignment = OrderAssignment.builder()
                    .order(order)
                    .agent(agent)
                    .assignmentType(request.assignmentType())
                    .assignedAt(LocalDateTime.now())
                    .unassignedAt(null)
                    .build();

        } else {

            assignment.setAgent(agent);
            assignment.setAssignmentType(
                    request.assignmentType()
            );
            assignment.setAssignedAt(
                    LocalDateTime.now()
            );
            assignment.setUnassignedAt(null);
        }

        OrderAssignment saved =
                assignmentRepository.save(assignment);

        // Agent becomes busy.
        agent.setAvailable(false);
        agentRepository.save(agent);

        // Keep orders.delivery_agent_id synchronized.
        order.setDeliveryAgent(agent.getUser());
        orderRepository.save(order);

        return toResponse(saved);
    }

    // =========================================================
    // AUTOMATIC ASSIGNMENT
    // =========================================================

    @Transactional
    public OrderAssignmentResponse autoAssignOrder(
            Long orderId) {

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
        // 2. VALIDATE ORDER
        // -----------------------------------------------------

        validateOrder(order);

        // -----------------------------------------------------
        // 3. CHECK ACTIVE ASSIGNMENT
        // -----------------------------------------------------

        if (assignmentRepository
                .existsByOrderIdAndUnassignedAtIsNull(orderId)) {

            throw new IllegalArgumentException(
                    "Order is already assigned to a delivery agent"
            );
        }

        // -----------------------------------------------------
        // 4. FIND AVAILABLE AGENTS
        // -----------------------------------------------------

        List<DeliveryAgent> availableAgents =
                agentRepository
                        .findByAvailableTrueAndActiveTrue();

        if (availableAgents == null
                || availableAgents.isEmpty()) {

            throw new IllegalArgumentException(
                    "No delivery agent is currently available"
            );
        }

        // -----------------------------------------------------
        // 5. FIND A VALID AGENT
        // -----------------------------------------------------

        DeliveryAgent selectedAgent = null;

        for (DeliveryAgent agent : availableAgents) {

            if (agent == null) {
                continue;
            }

            if (!Boolean.TRUE.equals(agent.getActive())) {
                continue;
            }

            if (!Boolean.TRUE.equals(agent.getAvailable())) {
                continue;
            }

            if (agent.getUser() == null) {
                continue;
            }

            if (!Boolean.TRUE.equals(
                    agent.getUser().getActive())) {
                continue;
            }

            if (agent.getUser().getRole()
                    != com.deliverytracker.entity.User.Role.DELIVERY_AGENT) {
                continue;
            }

            selectedAgent = agent;
            break;
        }

        if (selectedAgent == null) {

            throw new IllegalArgumentException(
                    "No valid delivery agent is currently available"
            );
        }

        // -----------------------------------------------------
        // 6. REUSE OLD ASSIGNMENT IF ONE EXISTS
        // -----------------------------------------------------

        OrderAssignment assignment =
                assignmentRepository
                        .findByOrderId(orderId)
                        .orElse(null);

        if (assignment == null) {

            assignment = OrderAssignment.builder()
                    .order(order)
                    .agent(selectedAgent)
                    .assignmentType(
                            OrderAssignment.AssignmentType.AUTOMATIC
                    )
                    .assignedAt(LocalDateTime.now())
                    .unassignedAt(null)
                    .build();

        } else {

            assignment.setAgent(selectedAgent);

            assignment.setAssignmentType(
                    OrderAssignment.AssignmentType.AUTOMATIC
            );

            assignment.setAssignedAt(
                    LocalDateTime.now()
            );

            assignment.setUnassignedAt(null);
        }

        // -----------------------------------------------------
        // 7. SAVE ASSIGNMENT
        // -----------------------------------------------------

        OrderAssignment saved =
                assignmentRepository.save(assignment);

        // -----------------------------------------------------
        // 8. MARK AGENT BUSY
        // -----------------------------------------------------

        selectedAgent.setAvailable(false);

        agentRepository.save(selectedAgent);

        // -----------------------------------------------------
        // 9. UPDATE ORDER
        // -----------------------------------------------------

        order.setDeliveryAgent(
                selectedAgent.getUser()
        );

        orderRepository.save(order);

        // -----------------------------------------------------
        // 10. RETURN RESPONSE
        // -----------------------------------------------------

        return toResponse(saved);
    }

    // =========================================================
    // GET ORDER ASSIGNMENT
    // =========================================================

    @Transactional(readOnly = true)
    public OrderAssignmentResponse getAssignmentByOrder(
            Long orderId) {

        return toResponse(
                assignmentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No assignment found for order: "
                                                + orderId
                                )
                        )
        );
    }

    // =========================================================
    // GET AGENT ASSIGNMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderAssignmentResponse> getAgentAssignments(
            Long agentId) {

        if (!agentRepository.existsById(agentId)) {

            throw new IllegalArgumentException(
                    "Delivery agent not found with id: "
                            + agentId
            );
        }

        return assignmentRepository
                .findByAgentIdOrderByAssignedAtDesc(agentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET ACTIVE AGENT ASSIGNMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderAssignmentResponse>
    getActiveAgentAssignments(Long agentId) {

        if (!agentRepository.existsById(agentId)) {

            throw new IllegalArgumentException(
                    "Delivery agent not found with id: "
                            + agentId
            );
        }

        return assignmentRepository
                .findByAgentIdAndUnassignedAtIsNullOrderByAssignedAtDesc(
                        agentId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // UNASSIGN ORDER
    // =========================================================

    @Transactional
    public OrderAssignmentResponse unassignOrder(
            Long orderId) {

        OrderAssignment assignment =
                assignmentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No assignment found for order: "
                                                + orderId
                                )
                        );

        if (assignment.getUnassignedAt() != null) {

            throw new IllegalArgumentException(
                    "Order is already unassigned"
            );
        }

        assignment.setUnassignedAt(
                LocalDateTime.now()
        );

        // Make agent available again.
        DeliveryAgent agent =
                assignment.getAgent();

        if (agent != null) {

            agent.setAvailable(true);
            agentRepository.save(agent);
        }

        // Clear delivery agent from order.
        Order order =
                assignment.getOrder();

        if (order != null) {

            order.setDeliveryAgent(null);
            orderRepository.save(order);
        }

        OrderAssignment saved =
                assignmentRepository.save(assignment);

        return toResponse(saved);
    }

    // =========================================================
    // VALIDATE ORDER
    // =========================================================

    private void validateOrder(Order order) {

        if (order.getStatus() == Order.Status.DELIVERED) {

            throw new IllegalArgumentException(
                    "Delivered order cannot be assigned"
            );
        }

        if (order.getStatus() == Order.Status.FAILED) {

            throw new IllegalArgumentException(
                    "Failed order cannot be assigned"
            );
        }
    }

    // =========================================================
    // VALIDATE AGENT
    // =========================================================

    private void validateAgent(
            DeliveryAgent agent) {

        if (!Boolean.TRUE.equals(
                agent.getActive())) {

            throw new IllegalArgumentException(
                    "Delivery agent is inactive"
            );
        }

        if (!Boolean.TRUE.equals(
                agent.getAvailable())) {

            throw new IllegalArgumentException(
                    "Delivery agent is currently unavailable"
            );
        }

        if (agent.getUser() == null) {

            throw new IllegalArgumentException(
                    "Delivery agent has no user account"
            );
        }

        if (!Boolean.TRUE.equals(
                agent.getUser().getActive())) {

            throw new IllegalArgumentException(
                    "Delivery agent's user account is inactive"
            );
        }

        if (agent.getUser().getRole()
                != com.deliverytracker.entity.User.Role.DELIVERY_AGENT) {

            throw new IllegalArgumentException(
                    "User does not have DELIVERY_AGENT role"
            );
        }
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    private OrderAssignmentResponse toResponse(
            OrderAssignment assignment) {

        DeliveryAgent agent =
                assignment.getAgent();

        return new OrderAssignmentResponse(
                assignment.getId(),
                assignment.getOrder().getId(),
                assignment.getOrder().getOrderNumber(),
                agent.getId(),
                agent.getUser().getId(),
                agent.getUser().getFullName(),
                assignment.getAssignmentType(),
                assignment.getAssignedAt(),
                assignment.getUnassignedAt()
        );
    }
}