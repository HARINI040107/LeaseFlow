package com.rentallease.rental_lease_backend.controller;

import com.rentallease.rental_lease_backend.entity.Application;
import com.rentallease.rental_lease_backend.entity.Invitation;
import com.rentallease.rental_lease_backend.entity.Party;
import com.rentallease.rental_lease_backend.entity.User;
import com.rentallease.rental_lease_backend.repository.ApplicationRepository;
import com.rentallease.rental_lease_backend.repository.PartyRepository;
import com.rentallease.rental_lease_backend.repository.UserRepository;
import com.rentallease.rental_lease_backend.service.EmailService;
import com.rentallease.rental_lease_backend.service.InvitationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tenant")
public class TenantController {

    private final InvitationService invitationService;
    private final ApplicationRepository applicationRepository;
    private final PartyRepository partyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public TenantController(
            InvitationService invitationService,
            ApplicationRepository applicationRepository,
            PartyRepository partyRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.invitationService =
                invitationService;

        this.applicationRepository =
                applicationRepository;

        this.partyRepository =
                partyRepository;

        this.userRepository =
                userRepository;

        this.emailService =
                emailService;
    }

    @GetMapping("/application/{token}")
    public ResponseEntity<?> getApplication(
            @PathVariable String token) {

        Invitation invitation =
                invitationService.findInvitation(token);

        if (invitation == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid or expired invitation link"
                    );
        }

        return ResponseEntity.ok(invitation);
    }

    @PostMapping("/application/{token}/complete")
    public ResponseEntity<?> completeApplication(
            @PathVariable String token) {

        Invitation invitation =
                invitationService.completeInvitation(token);

        if (invitation == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid or expired invitation link"
                    );
        }

        try {

            Application application =
                    applicationRepository
                            .findById(
                                    invitation
                                            .getApplicationId()
                            )
                            .orElse(null);

            if (application == null) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            Party tenant =
                    partyRepository
                            .findById(
                                    invitation
                                            .getPartyId()
                            )
                            .orElse(null);

            if (tenant == null) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            User homeowner =
                    userRepository
                            .findById(
                                    application
                                            .getHomeownerId()
                            )
                            .orElse(null);

            if (homeowner != null &&
                    homeowner.getEmail() != null &&
                    !homeowner.getEmail().isBlank()) {

                emailService
                        .sendTenantCompletedNotification(
                                homeowner.getEmail(),
                                tenant.getName()
                        );
            }

            return ResponseEntity.ok(
                    new CompletionResponse(
                            "Application completed successfully",
                            tenant.getName()
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Application was completed, "
                                    + "but notification email could not be sent."
                    );
        }
    }

    public static class CompletionResponse {

        private String message;
        private String tenantName;

        public CompletionResponse(
                String message,
                String tenantName) {

            this.message = message;
            this.tenantName = tenantName;
        }

        public String getMessage() {
            return message;
        }

        public String getTenantName() {
            return tenantName;
        }
    }
}