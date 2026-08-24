package com.deliverytracker.service;

import com.deliverytracker.dto.PriceCalculationRequest;
import com.deliverytracker.dto.PriceCalculationResponse;
import com.deliverytracker.entity.RateCard;
import com.deliverytracker.entity.Order.PaymentType;
import com.deliverytracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class PricingService {

    private static final BigDecimal VOLUMETRIC_DIVISOR =
            BigDecimal.valueOf(5000);

    private final ZoneRepository zoneRepository;
    private final RateCardService rateCardService;
    private final CodChargeService codChargeService;

    public PriceCalculationResponse calculatePrice(
            PriceCalculationRequest request) {

        validateZones(request);

        BigDecimal volumetricWeight =
                request.length()
                        .multiply(request.breadth())
                        .multiply(request.height())
                        .divide(
                                VOLUMETRIC_DIVISOR,
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal chargeableWeight =
                request.actualWeight()
                        .max(volumetricWeight);

        RateCard rateCard =
                rateCardService.findApplicableRateCard(
                        request.pickupZoneId(),
                        request.dropZoneId(),
                        request.orderType(),
                        chargeableWeight
                );

        BigDecimal baseCharge =
                calculateBaseCharge(
                        rateCard,
                        chargeableWeight
                );

        BigDecimal codCharge = BigDecimal.ZERO;

        if (request.paymentType() == PaymentType.COD) {
            codCharge =
                    codChargeService.calculateCodCharge(
                            request.orderType(),
                            baseCharge
                    );
        }

        BigDecimal totalCharge =
                baseCharge
                        .add(codCharge)
                        .setScale(2, RoundingMode.HALF_UP);

        return new PriceCalculationResponse(
                volumetricWeight.setScale(2, RoundingMode.HALF_UP),
                chargeableWeight.setScale(2, RoundingMode.HALF_UP),
                baseCharge.setScale(2, RoundingMode.HALF_UP),
                codCharge.setScale(2, RoundingMode.HALF_UP),
                totalCharge
        );
    }

    private void validateZones(
            PriceCalculationRequest request) {

        if (!zoneRepository.existsById(
                request.pickupZoneId())) {

            throw new IllegalArgumentException(
                    "Pickup zone not found"
            );
        }

        if (!zoneRepository.existsById(
                request.dropZoneId())) {

            throw new IllegalArgumentException(
                    "Drop zone not found"
            );
        }
    }

    private BigDecimal calculateBaseCharge(
            RateCard rateCard,
            BigDecimal chargeableWeight) {

        BigDecimal additionalWeight =
                chargeableWeight
                        .subtract(rateCard.getMinWeight());

        if (additionalWeight.compareTo(BigDecimal.ZERO) <= 0) {
            return rateCard.getBaseCharge();
        }

        return rateCard.getBaseCharge()
                .add(
                        additionalWeight.multiply(
                                rateCard.getAdditionalChargePerKg()
                        )
                );
    }
}