package com.deliverytracker.repository;

import com.deliverytracker.entity.RateCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RateCardRepository extends JpaRepository<RateCard, Long> {

    List<RateCard> findBySourceZoneIdAndDestinationZoneIdAndOrderTypeAndActiveTrue(
            Long sourceZoneId,
            Long destinationZoneId,
            RateCard.OrderType orderType
    );
}