package com.deliverytracker.repository;

import com.deliverytracker.entity.OrderAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderAssignmentRepository
        extends JpaRepository<OrderAssignment, Long> {

    Optional<OrderAssignment> findByOrderId(Long orderId);

    List<OrderAssignment>
    findByAgentIdOrderByAssignedAtDesc(
            Long agentId
    );

    boolean existsByOrderIdAndUnassignedAtIsNull(
            Long orderId
    );

    List<OrderAssignment>
    findByAgentIdAndUnassignedAtIsNullOrderByAssignedAtDesc(
            Long agentId
    );
}