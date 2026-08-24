package com.deliverytracker.service;

import com.deliverytracker.dto.CreateRescheduleRequest;
import com.deliverytracker.dto.RescheduleResponse;
import com.deliverytracker.entity.Order;
import com.deliverytracker.entity.RescheduleRequest;
import com.deliverytracker.repository.OrderRepository;
import com.deliverytracker.repository.RescheduleRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RescheduleService {

    private final RescheduleRequestRepository rescheduleRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public RescheduleResponse createRequest(
            Long orderId,
            CreateRescheduleRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found with id: " + orderId
                        )
                );

        validateOrder(order);

        RescheduleRequest rescheduleRequest =
                RescheduleRequest.builder()
                        .order(order)
                        .requestedDate(request.requestedDate())
                        .reason(request.reason())
                        .build();

        RescheduleRequest saved =
                rescheduleRepository.save(rescheduleRequest);

        order.setStatus(Order.Status.RESCHEDULED);
        orderRepository.save(order);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RescheduleResponse> getRequestsByOrder(
            Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new IllegalArgumentException(
                    "Order not found with id: " + orderId
            );
        }

        return rescheduleRepository
                .findByOrderIdOrderByRequestedAtDesc(orderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateOrder(Order order) {

        if (order.getStatus() == Order.Status.DELIVERED) {
            throw new IllegalArgumentException(
                    "Delivered order cannot be rescheduled"
            );
        }

        if (order.getStatus() == Order.Status.FAILED) {
            throw new IllegalArgumentException(
                    "Failed order cannot be rescheduled"
            );
        }

        if (order.getStatus() == Order.Status.RESCHEDULED) {
            throw new IllegalArgumentException(
                    "Order is already rescheduled"
            );
        }
    }

    private RescheduleResponse toResponse(
            RescheduleRequest request) {

        return new RescheduleResponse(
                request.getId(),
                request.getOrder().getId(),
                request.getOrder().getOrderNumber(),
                request.getRequestedDate(),
                request.getReason(),
                request.getRequestedAt()
        );
    }
}