package com.deliverytracker.dto;

import com.deliverytracker.entity.User;

public record AuthResponse(

        String token,

        Long userId,

        String email,

        String fullName,

        User.Role role
) {
}