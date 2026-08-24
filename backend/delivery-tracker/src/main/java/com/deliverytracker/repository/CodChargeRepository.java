package com.deliverytracker.repository;

import com.deliverytracker.entity.CodCharge;
import com.deliverytracker.entity.RateCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodChargeRepository extends JpaRepository<CodCharge, Long> {

    Optional<CodCharge> findByOrderTypeAndActiveTrue(
            RateCard.OrderType orderType
    );
}