package com.deliverytracker.service;

import com.deliverytracker.entity.CodCharge;
import com.deliverytracker.entity.RateCard;
import com.deliverytracker.repository.CodChargeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CodChargeService {

    private final CodChargeRepository codChargeRepository;

    public List<CodCharge> getAllCharges() {
        return codChargeRepository.findAll();
    }

    public CodCharge getChargeByOrderType(
            RateCard.OrderType orderType) {

        return codChargeRepository
                .findByOrderTypeAndActiveTrue(orderType)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "COD configuration not found for "
                                        + orderType
                        )
                );
    }

    public BigDecimal calculateCodCharge(
            RateCard.OrderType orderType,
            BigDecimal baseCharge) {

        CodCharge codCharge =
                getChargeByOrderType(orderType);

        BigDecimal percentageCharge =
                baseCharge
                        .multiply(codCharge.getPercentageCharge())
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        return codCharge.getFlatCharge()
                .add(percentageCharge)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public CodCharge createCodCharge(
            RateCard.OrderType orderType,
            BigDecimal flatCharge,
            BigDecimal percentageCharge) {

        if (flatCharge.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Flat COD charge cannot be negative"
            );
        }

        if (percentageCharge.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "COD percentage cannot be negative"
            );
        }

        CodCharge charge = CodCharge.builder()
                .orderType(orderType)
                .flatCharge(flatCharge)
                .percentageCharge(percentageCharge)
                .active(true)
                .build();

        return codChargeRepository.save(charge);
    }

    @Transactional
    public CodCharge updateCodCharge(
            Long id,
            BigDecimal flatCharge,
            BigDecimal percentageCharge,
            Boolean active) {

        CodCharge charge = codChargeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "COD charge not found with id: " + id
                        )
                );

        if (flatCharge.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Flat COD charge cannot be negative"
            );
        }

        if (percentageCharge.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "COD percentage cannot be negative"
            );
        }

        charge.setFlatCharge(flatCharge);
        charge.setPercentageCharge(percentageCharge);

        if (active != null) {
            charge.setActive(active);
        }

        return codChargeRepository.save(charge);
    }
}