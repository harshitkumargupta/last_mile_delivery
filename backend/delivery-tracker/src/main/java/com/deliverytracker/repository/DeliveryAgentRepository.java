package com.deliverytracker.repository;

import com.deliverytracker.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryAgentRepository
        extends JpaRepository<DeliveryAgent, Long> {

    Optional<DeliveryAgent> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<DeliveryAgent> findByAvailableTrueAndActiveTrue();

    List<DeliveryAgent>
    findByCurrentZoneIdAndAvailableTrueAndActiveTrue(
            Long zoneId
    );
}