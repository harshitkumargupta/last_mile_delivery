package com.deliverytracker.service;

import com.deliverytracker.dto.AuthResponse;
import com.deliverytracker.dto.LoginRequest;
import com.deliverytracker.dto.RegisterRequest;
import com.deliverytracker.entity.User;
import com.deliverytracker.repository.UserRepository;
import com.deliverytracker.security.CustomUserDetailsService;
import com.deliverytracker.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        if (request.role() != User.Role.CUSTOMER) {
            throw new IllegalArgumentException(
                    "Only CUSTOMER accounts can be registered"
            );
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .role(User.Role.CUSTOMER)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        savedUser.getEmail()
                );

        String token = jwtService.generateToken(userDetails);

        return toResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException(
                    "User account is inactive"
            );
        }

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        user.getEmail()
                );

        String token = jwtService.generateToken(userDetails);

        return toResponse(user, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        return new AuthResponse(
                null,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    private AuthResponse toResponse(
            User user,
            String token) {

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }
}