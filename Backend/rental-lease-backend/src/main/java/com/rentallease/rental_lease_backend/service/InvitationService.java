package com.rentallease.rental_lease_backend.service;

import com.rentallease.rental_lease_backend.entity.Invitation;
import com.rentallease.rental_lease_backend.repository.InvitationRepository;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;

    private final SecureRandom secureRandom =
            new SecureRandom();

    public InvitationService(
            InvitationRepository invitationRepository) {

        this.invitationRepository = invitationRepository;
    }

    public String createInvitation(
            UUID applicationId,
            UUID partyId,
            String email) {

        byte[] randomBytes = new byte[32];

        secureRandom.nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        String tokenHash = hashToken(token);

        Invitation invitation = new Invitation();

        invitation.setApplicationId(applicationId);
        invitation.setPartyId(partyId);
        invitation.setEmail(email);
        invitation.setTokenHash(tokenHash);
        invitation.setStatus("PENDING");

        invitation.setExpiresAt(
                LocalDateTime.now().plusDays(7)
        );

        invitationRepository.save(invitation);

        return token;
    }

    public Invitation findInvitation(String token) {

        String tokenHash = hashToken(token);

        Invitation invitation =
                invitationRepository
                        .findByTokenHash(tokenHash)
                        .orElse(null);

        if (invitation == null) {
            return null;
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            return null;
        }

        if (invitation.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);

            return null;
        }

        return invitation;
    }

    public Invitation completeInvitation(String token) {

        Invitation invitation =
                findInvitation(token);

        if (invitation == null) {
            return null;
        }

        invitation.setStatus("COMPLETED");

        return invitationRepository.save(invitation);
    }

    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    e
            );
        }
    }
}