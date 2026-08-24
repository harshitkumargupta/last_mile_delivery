package com.deliverytracker.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.deliverytracker.dto.CreateCodChargeRequest;
import com.deliverytracker.entity.CodCharge;
import com.deliverytracker.service.CodChargeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cod-charges")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CodChargeController {

    private final CodChargeService codChargeService;

    @GetMapping
    public ResponseEntity<List<CodCharge>> getAllCharges() {
        return ResponseEntity.ok(
                codChargeService.getAllCharges()
        );
    }

    @GetMapping("/{orderType}")
    public ResponseEntity<CodCharge> getCharge(
            @PathVariable
            com.deliverytracker.entity.RateCard.OrderType orderType) {

        return ResponseEntity.ok(
                codChargeService.getChargeByOrderType(orderType)
        );
    }

    @PostMapping
    public ResponseEntity<CodCharge> createCharge(
            @Valid @RequestBody CreateCodChargeRequest request) {

        CodCharge charge =
                codChargeService.createCodCharge(
                        request.orderType(),
                        request.flatCharge(),
                        request.percentageCharge()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(charge);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CodCharge> updateCharge(
            @PathVariable Long id,
            @Valid @RequestBody CreateCodChargeRequest request) {

        return ResponseEntity.ok(
                codChargeService.updateCodCharge(
                        id,
                        request.flatCharge(),
                        request.percentageCharge(),
                        null
                )
        );
    }
}