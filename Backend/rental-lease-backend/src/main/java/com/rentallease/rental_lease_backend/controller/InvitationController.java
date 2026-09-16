package com.rentallease.rental_lease_backend.controller;

import com.rentallease.rental_lease_backend.service.EmailService;
import com.rentallease.rental_lease_backend.service.InvitationService;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/applications/{applicationId}/invitations")
public class InvitationController {

    private final InvitationService invitationService;
    private final EmailService emailService;

    public InvitationController(
            InvitationService invitationService,
            EmailService emailService) {

        this.invitationService =
                invitationService;

        this.emailService =
                emailService;
    }

    @PostMapping
    public InvitationResponse createInvitation(
            @PathVariable UUID applicationId,
            @RequestBody InvitationRequest request) {

        String token =
                invitationService.createInvitation(
                        applicationId,
                        request.getPartyId(),
                        request.getEmail()
                );

        String link =
                "http://localhost:5173/tenant/"
                        + token;

        // Send invitation email
        emailService.sendTenantInvitation(
                request.getEmail(),
                request.getTenantName(),
                link
        );

        return new InvitationResponse(
                "Invitation created and email sent successfully",
                link
        );
    }

    public static class InvitationRequest {

        private UUID partyId;
        private String email;
        private String tenantName;

        public UUID getPartyId() {
            return partyId;
        }

        public void setPartyId(UUID partyId) {
            this.partyId = partyId;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getTenantName() {
            return tenantName;
        }

        public void setTenantName(String tenantName) {
            this.tenantName = tenantName;
        }
    }

    public static class InvitationResponse {

        private String message;
        private String invitationLink;

        public InvitationResponse(
                String message,
                String invitationLink) {

            this.message = message;
            this.invitationLink = invitationLink;
        }

        public String getMessage() {
            return message;
        }

        public String getInvitationLink() {
            return invitationLink;
        }
    }
}