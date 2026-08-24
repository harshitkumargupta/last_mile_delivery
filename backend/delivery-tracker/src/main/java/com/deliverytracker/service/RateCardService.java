package com.deliverytracker.service;

import com.deliverytracker.entity.RateCard;
import com.deliverytracker.repository.RateCardRepository;
import com.deliverytracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RateCardService {

    private final RateCardRepository rateCardRepository;
    private final ZoneRepository zoneRepository;

    public List<RateCard> getAllRateCards() {
        return rateCardRepository.findAll();
    }

    public RateCard getRateCardById(Long id) {
        return rateCardRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Rate card not found with id: " + id
                        )
                );
    }

    public List<RateCard> getRateCards(
            Long sourceZoneId,
            Long destinationZoneId,
            RateCard.OrderType orderType) {

        return rateCardRepository
                .findBySourceZoneIdAndDestinationZoneIdAndOrderTypeAndActiveTrue(
                        sourceZoneId,
                        destinationZoneId,
                        orderType
                );
    }

    public RateCard findApplicableRateCard(
            Long sourceZoneId,
            Long destinationZoneId,
            RateCard.OrderType orderType,
            BigDecimal chargeableWeight) {

        return getRateCards(
                sourceZoneId,
                destinationZoneId,
                orderType
        ).stream()
                .filter(rateCard ->
                        chargeableWeight.compareTo(
                                rateCard.getMinWeight()
                        ) >= 0
                        &&
                        chargeableWeight.compareTo(
                                rateCard.getMaxWeight()
                        ) <= 0
                )
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No applicable rate card found for weight: "
                                        + chargeableWeight
                        )
                );
    }

    @Transactional
    public RateCard createRateCard(
            Long sourceZoneId,
            Long destinationZoneId,
            RateCard.OrderType orderType,
            BigDecimal minWeight,
            BigDecimal maxWeight,
            BigDecimal baseCharge,
            BigDecimal additionalChargePerKg) {

        if (!zoneRepository.existsById(sourceZoneId)) {
            throw new IllegalArgumentException(
                    "Source zone not found"
            );
        }

        if (!zoneRepository.existsById(destinationZoneId)) {
            throw new IllegalArgumentException(
                    "Destination zone not found"
            );
        }

        if (minWeight.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Minimum weight cannot be negative"
            );
        }

        if (maxWeight.compareTo(minWeight) < 0) {
            throw new IllegalArgumentException(
                    "Maximum weight cannot be less than minimum weight"
            );
        }

        if (baseCharge.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Base charge cannot be negative"
            );
        }

        if (additionalChargePerKg.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Additional charge cannot be negative"
            );
        }

        RateCard rateCard = RateCard.builder()
                .sourceZone(
                        zoneRepository.findById(sourceZoneId).orElseThrow()
                )
                .destinationZone(
                        zoneRepository.findById(destinationZoneId).orElseThrow()
                )
                .orderType(orderType)
                .minWeight(minWeight)
                .maxWeight(maxWeight)
                .baseCharge(baseCharge)
                .additionalChargePerKg(additionalChargePerKg)
                .active(true)
                .build();

        return rateCardRepository.save(rateCard);
    }

    @Transactional
    public RateCard updateRateCard(
            Long id,
            BigDecimal minWeight,
            BigDecimal maxWeight,
            BigDecimal baseCharge,
            BigDecimal additionalChargePerKg,
            Boolean active) {

        RateCard rateCard = getRateCardById(id);

        if (minWeight.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Minimum weight cannot be negative"
            );
        }

        if (maxWeight.compareTo(minWeight) < 0) {
            throw new IllegalArgumentException(
                    "Maximum weight cannot be less than minimum weight"
            );
        }

        rateCard.setMinWeight(minWeight);
        rateCard.setMaxWeight(maxWeight);
        rateCard.setBaseCharge(baseCharge);
        rateCard.setAdditionalChargePerKg(additionalChargePerKg);

        if (active != null) {
            rateCard.setActive(active);
        }

        return rateCardRepository.save(rateCard);
    }

    @Transactional
    public void deactivateRateCard(Long id) {
        RateCard rateCard = getRateCardById(id);
        rateCard.setActive(false);
        rateCardRepository.save(rateCard);
    }
}