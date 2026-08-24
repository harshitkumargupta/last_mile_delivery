package com.deliverytracker.repository;

import com.deliverytracker.entity.ZoneArea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ZoneAreaRepository extends JpaRepository<ZoneArea, Long> {

    List<ZoneArea> findByZoneIdAndActiveTrue(Long zoneId);

    Optional<ZoneArea> findByPincodeAndActiveTrue(String pincode);
}