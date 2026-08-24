package com.deliverytracker.service;

import com.deliverytracker.entity.Zone;
import com.deliverytracker.entity.ZoneArea;
import com.deliverytracker.repository.ZoneAreaRepository;
import com.deliverytracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final ZoneAreaRepository zoneAreaRepository;

    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }

    public List<Zone> getActiveZones() {
        return zoneRepository.findAll()
                .stream()
                .filter(Zone::getActive)
                .toList();
    }

    public Zone getZoneById(Long id) {
        return zoneRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Zone not found with id: " + id
                        )
                );
    }

    public Zone getZoneByName(String name) {
        return zoneRepository.findByName(name)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Zone not found: " + name
                        )
                );
    }

    @Transactional
    public Zone createZone(String name, String description) {

        if (zoneRepository.existsByName(name)) {
            throw new IllegalArgumentException(
                    "Zone already exists: " + name
            );
        }

        Zone zone = Zone.builder()
                .name(name)
                .description(description)
                .active(true)
                .build();

        return zoneRepository.save(zone);
    }

    @Transactional
    public Zone updateZone(
            Long id,
            String name,
            String description,
            Boolean active) {

        Zone zone = getZoneById(id);

        if (!zone.getName().equals(name)
                && zoneRepository.existsByName(name)) {

            throw new IllegalArgumentException(
                    "Zone already exists: " + name
            );
        }

        zone.setName(name);
        zone.setDescription(description);

        if (active != null) {
            zone.setActive(active);
        }

        return zoneRepository.save(zone);
    }

    @Transactional
    public void deactivateZone(Long id) {

        Zone zone = getZoneById(id);

        zone.setActive(false);

        zoneRepository.save(zone);
    }

    public List<ZoneArea> getAreasByZone(Long zoneId) {

        getZoneById(zoneId);

        return zoneAreaRepository
                .findByZoneIdAndActiveTrue(zoneId);
    }

    public ZoneArea getAreaByPincode(String pincode) {

        return zoneAreaRepository
                .findByPincodeAndActiveTrue(pincode)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No active zone found for pincode: "
                                        + pincode
                        )
                );
    }

    @Transactional
    public ZoneArea createArea(
            Long zoneId,
            String areaName,
            String city,
            String state,
            String pincode) {

        Zone zone = getZoneById(zoneId);

        ZoneArea area = ZoneArea.builder()
                .areaName(areaName)
                .city(city)
                .state(state)
                .pincode(pincode)
                .zone(zone)
                .active(true)
                .build();

        return zoneAreaRepository.save(area);
    }
}