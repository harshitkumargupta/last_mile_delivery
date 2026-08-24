package com.deliverytracker.service;

import com.deliverytracker.dto.CreateDeliveryAgentRequest;
import com.deliverytracker.dto.DeliveryAgentResponse;
import com.deliverytracker.dto.UpdateAgentAvailabilityRequest;
import com.deliverytracker.dto.UpdateAgentLocationRequest;
import com.deliverytracker.entity.DeliveryAgent;
import com.deliverytracker.entity.User;
import com.deliverytracker.entity.Zone;
import com.deliverytracker.repository.DeliveryAgentRepository;
import com.deliverytracker.repository.UserRepository;
import com.deliverytracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryAgentService {

    private final DeliveryAgentRepository deliveryAgentRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;

    @Transactional
    public DeliveryAgentResponse createAgent(
            CreateDeliveryAgentRequest request) {

        User user = userRepository.findById(request.userId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: "
                                        + request.userId()
                        )
                );

        if (user.getRole() != User.Role.DELIVERY_AGENT) {
            throw new IllegalArgumentException(
                    "User must have DELIVERY_AGENT role"
            );
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException(
                    "User account is inactive"
            );
        }

        if (deliveryAgentRepository.existsByUserId(user.getId())) {
            throw new IllegalArgumentException(
                    "Delivery agent already exists for this user"
            );
        }

        DeliveryAgent agent = DeliveryAgent.builder()
                .user(user)
                .available(true)
                .active(true)
                .build();

        return toResponse(
                deliveryAgentRepository.save(agent)
        );
    }

    @Transactional(readOnly = true)
    public DeliveryAgentResponse getAgentById(Long id) {

        return toResponse(
                deliveryAgentRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Delivery agent not found with id: "
                                                + id
                                )
                        )
        );
    }

    @Transactional(readOnly = true)
    public DeliveryAgentResponse getAgentByUserId(
            Long userId) {

        return toResponse(
                deliveryAgentRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Delivery agent not found for user: "
                                                + userId
                                )
                        )
        );
    }

    @Transactional(readOnly = true)
    public List<DeliveryAgentResponse> getAvailableAgents() {

        return deliveryAgentRepository
                .findByAvailableTrueAndActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryAgentResponse> getAvailableAgentsByZone(
            Long zoneId) {

        if (!zoneRepository.existsById(zoneId)) {
            throw new IllegalArgumentException(
                    "Zone not found with id: " + zoneId
            );
        }

        return deliveryAgentRepository
                .findByCurrentZoneIdAndAvailableTrueAndActiveTrue(
                        zoneId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DeliveryAgentResponse updateLocation(
            Long agentId,
            UpdateAgentLocationRequest request) {

        DeliveryAgent agent = getAgentEntity(agentId);

        if (!Boolean.TRUE.equals(agent.getActive())) {
            throw new IllegalArgumentException(
                    "Delivery agent is inactive"
            );
        }

        agent.setLatitude(request.latitude());
        agent.setLongitude(request.longitude());

        if (request.zoneId() != null) {

            Zone zone = zoneRepository.findById(
                    request.zoneId()
            ).orElseThrow(() ->
                    new IllegalArgumentException(
                            "Zone not found with id: "
                                    + request.zoneId()
                    )
            );

            if (!Boolean.TRUE.equals(zone.getActive())) {
                throw new IllegalArgumentException(
                        "Zone is inactive"
                );
            }

            agent.setCurrentZone(zone);
        }

        return toResponse(
                deliveryAgentRepository.save(agent)
        );
    }

    @Transactional
    public DeliveryAgentResponse updateAvailability(
            Long agentId,
            UpdateAgentAvailabilityRequest request) {

        DeliveryAgent agent = getAgentEntity(agentId);

        if (!Boolean.TRUE.equals(agent.getActive())) {
            throw new IllegalArgumentException(
                    "Delivery agent is inactive"
            );
        }

        agent.setAvailable(request.available());

        return toResponse(
                deliveryAgentRepository.save(agent)
        );
    }

    @Transactional
    public void deactivateAgent(Long agentId) {

        DeliveryAgent agent = getAgentEntity(agentId);

        agent.setActive(false);
        agent.setAvailable(false);

        deliveryAgentRepository.save(agent);
    }

    private DeliveryAgent getAgentEntity(Long id) {

        return deliveryAgentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Delivery agent not found with id: "
                                        + id
                        )
                );
    }
    
    @Transactional(readOnly = true)
public DeliveryAgentResponse getAgentByEmail(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "User not found with email: " + email
                    )
            );

    return getAgentByUserId(user.getId());
}

    private DeliveryAgentResponse toResponse(
            DeliveryAgent agent) {

        Zone zone = agent.getCurrentZone();

        return new DeliveryAgentResponse(
                agent.getId(),
                agent.getUser().getId(),
                agent.getUser().getFullName(),
                agent.getUser().getEmail(),
                agent.getUser().getPhone(),
                agent.getAvailable(),
                agent.getLatitude(),
                agent.getLongitude(),
                zone != null ? zone.getId() : null,
                zone != null ? zone.getName() : null,
                agent.getActive()
        );
    }
}