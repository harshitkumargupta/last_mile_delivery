package com.deliverytracker.service;

import com.deliverytracker.dto.CreateOrderRequest;
import com.deliverytracker.dto.OrderResponse;
import com.deliverytracker.dto.PriceCalculationRequest;
import com.deliverytracker.dto.PriceCalculationResponse;
import com.deliverytracker.entity.Order;
import com.deliverytracker.entity.OrderTrackingHistory;
import com.deliverytracker.entity.User;
import com.deliverytracker.entity.Zone;
import com.deliverytracker.repository.OrderRepository;
import com.deliverytracker.repository.OrderTrackingHistoryRepository;
import com.deliverytracker.repository.UserRepository;
import com.deliverytracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderTrackingHistoryRepository trackingRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final PricingService pricingService;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;


    // =========================================================
    // CREATE ORDER
    // =========================================================

    @Transactional
    public OrderResponse createOrder(
            CreateOrderRequest request) {

        User customer =
                userRepository.findById(
                        request.customerId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer not found with id: "
                                        + request.customerId()
                        )
                );

        if (customer.getRole()
                != User.Role.CUSTOMER) {

            throw new IllegalArgumentException(
                    "Selected user is not a customer"
            );
        }

        if (!Boolean.TRUE.equals(
                customer.getActive())) {

            throw new IllegalArgumentException(
                    "Customer account is inactive"
            );
        }

        Zone pickupZone =
                zoneRepository.findById(
                        request.pickupZoneId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Pickup zone not found with id: "
                                        + request.pickupZoneId()
                        )
                );

        Zone dropZone =
                zoneRepository.findById(
                        request.dropZoneId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Drop zone not found with id: "
                                        + request.dropZoneId()
                        )
                );

        if (!Boolean.TRUE.equals(
                pickupZone.getActive())) {

            throw new IllegalArgumentException(
                    "Pickup zone is inactive"
            );
        }

        if (!Boolean.TRUE.equals(
                dropZone.getActive())) {

            throw new IllegalArgumentException(
                    "Drop zone is inactive"
            );
        }

        PriceCalculationRequest pricingRequest =
                new PriceCalculationRequest(
                        request.pickupZoneId(),
                        request.dropZoneId(),
                        request.length(),
                        request.breadth(),
                        request.height(),
                        request.actualWeight(),
                        request.orderType(),
                        request.paymentType()
                );

        PriceCalculationResponse price =
                pricingService.calculatePrice(
                        pricingRequest
                );

        Order order =
                Order.builder()
                        .orderNumber(
                                generateOrderNumber()
                        )
                        .customer(customer)
                        .deliveryAgent(null)
                        .pickupAddress(
                                request.pickupAddress()
                        )
                        .dropAddress(
                                request.dropAddress()
                        )
                        .pickupZone(pickupZone)
                        .dropZone(dropZone)
                        .length(request.length())
                        .breadth(request.breadth())
                        .height(request.height())
                        .actualWeight(
                                request.actualWeight()
                        )
                        .volumetricWeight(
                                price.volumetricWeight()
                        )
                        .chargeableWeight(
                                price.chargeableWeight()
                        )
                        .orderType(
                                request.orderType()
                        )
                        .paymentType(
                                request.paymentType()
                        )
                        .baseCharge(
                                price.baseCharge()
                        )
                        .codCharge(
                                price.codCharge()
                        )
                        .totalCharge(
                                price.totalCharge()
                        )
                        .status(
                                Order.Status.CREATED
                        )
                        .build();

        Order savedOrder =
                orderRepository.save(order);

        OrderTrackingHistory history =
                OrderTrackingHistory.builder()
                        .order(savedOrder)
                        .status(Order.Status.CREATED)
                        .actor(customer)
                        .remarks("Order created")
                        .build();

        trackingRepository.save(history);

        // =====================================================
        // DATABASE NOTIFICATION
        // =====================================================

        notificationService.notifyOrderStatus(
                savedOrder,
                Order.Status.CREATED
        );

        // =====================================================
        // EMAIL NOTIFICATION
        // =====================================================

        emailNotificationService.sendOrderNotification(
                customer.getEmail(),
                savedOrder.getOrderNumber(),
                Order.Status.CREATED.name()
        );

        return toResponse(savedOrder);
    }


    // =========================================================
    // ADMIN - ALL ORDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(
            Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found with id: "
                                                + id
                                )
                        );

        return toResponse(order);
    }


    // =========================================================
    // GET ORDER BY NUMBER
    // =========================================================

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(
            String orderNumber) {

        Order order =
                orderRepository
                        .findByOrderNumber(orderNumber)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found: "
                                                + orderNumber
                                )
                        );

        return toResponse(order);
    }


    // =========================================================
    // CUSTOMER ORDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(
            Long customerId) {

        if (!userRepository.existsById(
                customerId)) {

            throw new IllegalArgumentException(
                    "Customer not found with id: "
                            + customerId
            );
        }

        return orderRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customerId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // ORDERS BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(
            Order.Status status) {

        return orderRepository
                .findByStatus(status)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // ASSIGN ORDER TO DELIVERY AGENT
    // =========================================================

    @Transactional
    public OrderResponse assignOrderToAgent(
            Long orderId,
            Long agentId) {

        Order order =
                orderRepository.findById(
                        orderId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found with id: "
                                        + orderId
                        )
                );

        User agent =
                userRepository.findById(
                        agentId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Delivery agent not found with id: "
                                        + agentId
                        )
                );

        if (agent.getRole()
                != User.Role.DELIVERY_AGENT) {

            throw new IllegalArgumentException(
                    "Selected user is not a delivery agent"
            );
        }

        if (!Boolean.TRUE.equals(
                agent.getActive())) {

            throw new IllegalArgumentException(
                    "Delivery agent account is inactive"
            );
        }

        order.setDeliveryAgent(agent);

        Order savedOrder =
                orderRepository.save(order);

        OrderTrackingHistory history =
                OrderTrackingHistory.builder()
                        .order(savedOrder)
                        .status(savedOrder.getStatus())
                        .actor(agent)
                        .remarks(
                                "Order assigned to delivery agent: "
                                        + agent.getFullName()
                        )
                        .build();

        trackingRepository.save(history);

        return toResponse(savedOrder);
    }


    // =========================================================
    // DELIVERY AGENT ORDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getAgentOrders(
            Long agentId) {

        User agent =
                userRepository.findById(
                        agentId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Delivery agent not found with id: "
                                        + agentId
                        )
                );

        if (agent.getRole()
                != User.Role.DELIVERY_AGENT) {

            throw new IllegalArgumentException(
                    "User is not a delivery agent"
            );
        }

        return orderRepository
                .findByDeliveryAgentIdOrderByCreatedAtDesc(
                        agentId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Transactional
    public OrderResponse updateStatus(
            Long orderId,
            Order.Status newStatus) {

        Order order =
                orderRepository.findById(
                        orderId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found with id: "
                                        + orderId
                        )
                );

        Order.Status currentStatus =
                order.getStatus();

        validateStatusTransition(
                currentStatus,
                newStatus
        );

        order.setStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        User actor =
                savedOrder.getDeliveryAgent();

        if (actor == null) {
            actor = savedOrder.getCustomer();
        }

        String remarks =
                "Status changed from "
                        + currentStatus
                        + " to "
                        + newStatus;

        OrderTrackingHistory history =
                OrderTrackingHistory.builder()
                        .order(savedOrder)
                        .status(newStatus)
                        .actor(actor)
                        .remarks(remarks)
                        .build();

        trackingRepository.save(history);

        // =====================================================
        // DATABASE NOTIFICATION
        // =====================================================

        notificationService.notifyOrderStatus(
                savedOrder,
                newStatus
        );

        // =====================================================
        // EMAIL NOTIFICATION
        // =====================================================

        emailNotificationService.sendOrderNotification(
                savedOrder.getCustomer().getEmail(),
                savedOrder.getOrderNumber(),
                newStatus.name()
        );

        return toResponse(savedOrder);
    }


    // =========================================================
    // STATUS TRANSITIONS
    // =========================================================

    private void validateStatusTransition(
            Order.Status current,
            Order.Status next) {

        if (current == next) {
            return;
        }

        boolean valid =
                switch (current) {

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

                    case DELIVERED,
                         FAILED ->
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
    // ORDER NUMBER
    // =========================================================

    private String generateOrderNumber() {

        String orderNumber;

        do {

            orderNumber =
                    "ORD-"
                            + UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 12)
                            .toUpperCase();

        } while (
                orderRepository
                        .findByOrderNumber(
                                orderNumber
                        )
                        .isPresent()
        );

        return orderNumber;
    }


    // =========================================================
    // RESPONSE
    // =========================================================

    private OrderResponse toResponse(
            Order order) {

        Long deliveryAgentId = null;
        String deliveryAgentName = null;

        if (order.getDeliveryAgent() != null) {

            deliveryAgentId =
                    order.getDeliveryAgent().getId();

            deliveryAgentName =
                    order.getDeliveryAgent()
                            .getFullName();
        }

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomer().getId(),

                deliveryAgentId,
                deliveryAgentName,

                order.getPickupAddress(),
                order.getDropAddress(),

                order.getPickupZone() != null
                        ? order.getPickupZone().getId()
                        : null,

                order.getDropZone() != null
                        ? order.getDropZone().getId()
                        : null,

                order.getLength(),
                order.getBreadth(),
                order.getHeight(),
                order.getActualWeight(),
                order.getVolumetricWeight(),
                order.getChargeableWeight(),

                order.getOrderType(),
                order.getPaymentType(),

                order.getBaseCharge(),
                order.getCodCharge(),
                order.getTotalCharge(),

                order.getStatus(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}