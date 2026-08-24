package com.deliverytracker.controller;

import com.deliverytracker.dto.PriceCalculationRequest;
import com.deliverytracker.dto.PriceCalculationResponse;
import com.deliverytracker.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @PostMapping("/calculate")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(
            @Valid @RequestBody PriceCalculationRequest request) {

        return ResponseEntity.ok(
                pricingService.calculatePrice(request)
        );
    }
}