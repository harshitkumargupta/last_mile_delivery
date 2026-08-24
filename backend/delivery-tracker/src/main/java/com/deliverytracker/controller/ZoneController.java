package com.deliverytracker.controller;

import com.deliverytracker.dto.CreateZoneAreaRequest;
import com.deliverytracker.dto.CreateZoneRequest;
import com.deliverytracker.entity.Zone;
import com.deliverytracker.entity.ZoneArea;
import com.deliverytracker.service.ZoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    // ==========================================
    // CUSTOMER / ADMIN - VIEW ZONES
    // ==========================================

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<Zone>> getAllZones() {
        return ResponseEntity.ok(
                zoneService.getAllZones()
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<Zone>> getActiveZones() {
        return ResponseEntity.ok(
                zoneService.getActiveZones()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Zone> getZone(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                zoneService.getZoneById(id)
        );
    }

    // ==========================================
    // ADMIN - ZONE MANAGEMENT
    // ==========================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Zone> createZone(
            @Valid @RequestBody CreateZoneRequest request) {

        Zone zone = zoneService.createZone(
                request.name(),
                request.description()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(zone);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Zone> updateZone(
            @PathVariable Long id,
            @Valid @RequestBody CreateZoneRequest request) {

        return ResponseEntity.ok(
                zoneService.updateZone(
                        id,
                        request.name(),
                        request.description(),
                        null
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateZone(
            @PathVariable Long id) {

        zoneService.deactivateZone(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // CUSTOMER / ADMIN - VIEW AREAS
    // ==========================================

    @GetMapping("/{zoneId}/areas")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ZoneArea>> getAreas(
            @PathVariable Long zoneId) {

        return ResponseEntity.ok(
                zoneService.getAreasByZone(zoneId)
        );
    }

    @GetMapping("/area/pincode/{pincode}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ZoneArea> getAreaByPincode(
            @PathVariable String pincode) {

        return ResponseEntity.ok(
                zoneService.getAreaByPincode(pincode)
        );
    }

    // ==========================================
    // ADMIN - AREA MANAGEMENT
    // ==========================================

    @PostMapping("/{zoneId}/areas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ZoneArea> createArea(
            @PathVariable Long zoneId,
            @Valid @RequestBody CreateZoneAreaRequest request) {

        ZoneArea area = zoneService.createArea(
                zoneId,
                request.areaName(),
                request.city(),
                request.state(),
                request.pincode()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(area);
    }
}