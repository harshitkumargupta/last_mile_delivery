package com.deliverytracker.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.deliverytracker.dto.CreateRateCardRequest;
import com.deliverytracker.entity.RateCard;
import com.deliverytracker.service.RateCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rate-cards")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RateCardController {

    private final RateCardService rateCardService;

    @GetMapping
    public ResponseEntity<List<RateCard>> getAllRateCards() {
        return ResponseEntity.ok(
                rateCardService.getAllRateCards()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RateCard> getRateCard(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                rateCardService.getRateCardById(id)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<RateCard>> getRateCards(
            @RequestParam Long sourceZoneId,
            @RequestParam Long destinationZoneId,
            @RequestParam RateCard.OrderType orderType) {

        return ResponseEntity.ok(
                rateCardService.getRateCards(
                        sourceZoneId,
                        destinationZoneId,
                        orderType
                )
        );
    }

    @PostMapping
    public ResponseEntity<RateCard> createRateCard(
            @Valid @RequestBody CreateRateCardRequest request) {

        RateCard rateCard =
                rateCardService.createRateCard(
                        request.sourceZoneId(),
                        request.destinationZoneId(),
                        request.orderType(),
                        request.minWeight(),
                        request.maxWeight(),
                        request.baseCharge(),
                        request.additionalChargePerKg()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(rateCard);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RateCard> updateRateCard(
            @PathVariable Long id,
            @Valid @RequestBody CreateRateCardRequest request) {

        return ResponseEntity.ok(
                rateCardService.updateRateCard(
                        id,
                        request.minWeight(),
                        request.maxWeight(),
                        request.baseCharge(),
                        request.additionalChargePerKg(),
                        null
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateRateCard(
            @PathVariable Long id) {

        rateCardService.deactivateRateCard(id);

        return ResponseEntity.noContent().build();
    }
}