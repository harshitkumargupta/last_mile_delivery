package com.deliverytracker.repository;

import com.deliverytracker.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    List<Order> findByDeliveryAgentIdOrderByCreatedAtDesc(
            Long deliveryAgentId
    );

    List<Order> findByStatus(
            Order.Status status
    );
}