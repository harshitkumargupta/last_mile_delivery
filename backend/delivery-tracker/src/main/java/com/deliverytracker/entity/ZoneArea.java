package com.deliverytracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "zone_areas",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"zone_id", "area_name"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoneArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "area_name", nullable = false, length = 150)
    private String areaName;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(nullable = false)
    private Boolean active = true;
}