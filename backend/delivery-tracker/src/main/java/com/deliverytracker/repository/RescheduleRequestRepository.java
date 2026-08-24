package com.deliverytracker.repository;

import com.deliverytracker.entity.RescheduleRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RescheduleRequestRepository
        extends JpaRepository<RescheduleRequest, Long> {

    List<RescheduleRequest> findByOrderIdOrderByRequestedAtDesc(
            Long orderId
    );
}