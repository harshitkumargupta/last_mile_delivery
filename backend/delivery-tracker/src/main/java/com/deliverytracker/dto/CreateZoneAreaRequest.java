package com.deliverytracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateZoneAreaRequest(

        @NotBlank
        @Size(max = 150)
        String areaName,

        @Size(max = 100)
        String city,

        @Size(max = 100)
        String state,

        @Size(max = 10)
        String pincode
) {
}