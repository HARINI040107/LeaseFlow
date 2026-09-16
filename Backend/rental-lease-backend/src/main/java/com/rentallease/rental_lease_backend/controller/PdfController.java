package com.rentallease.rental_lease_backend.controller;

import com.rentallease.rental_lease_backend.entity.Application;
import com.rentallease.rental_lease_backend.entity.Party;
import com.rentallease.rental_lease_backend.entity.Signature;
import com.rentallease.rental_lease_backend.entity.User;

import com.rentallease.rental_lease_backend.repository.ApplicationRepository;
import com.rentallease.rental_lease_backend.repository.PartyRepository;
import com.rentallease.rental_lease_backend.repository.SignatureRepository;
import com.rentallease.rental_lease_backend.repository.UserRepository;

import com.rentallease.rental_lease_backend.service.EmailService;
import com.rentallease.rental_lease_backend.service.PdfService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class PdfController {

    private final PdfService pdfService;
    private final ApplicationRepository applicationRepository;
    private final PartyRepository partyRepository;
    private final SignatureRepository signatureRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public PdfController(
            PdfService pdfService,
            ApplicationRepository applicationRepository,
            PartyRepository partyRepository,
            SignatureRepository signatureRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.pdfService =
                pdfService;

        this.applicationRepository =
                applicationRepository;

        this.partyRepository =
                partyRepository;

        this.signatureRepository =
                signatureRepository;

        this.userRepository =
                userRepository;

        this.emailService =
                emailService;
    }

    @GetMapping("/{applicationId}/pdf")
    public ResponseEntity<?> generatePdf(
            @PathVariable UUID applicationId) {

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElse(null);

        if (application == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        List<Party> parties =
                partyRepository
                        .findByApplicationId(
                                applicationId
                        );

        List<Signature> signatures =
                signatureRepository
                        .findByApplicationId(
                                applicationId
                        );

        /*
         * Check homeowner signature
         */
        boolean homeownerSigned =
                signatures.stream()
                        .anyMatch(signature ->
                                "HOMEOWNER".equals(
                                        signature
                                                .getSignerType()
                                )
                        );

        if (!homeownerSigned) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Homeowner signature is required before generating the final agreement."
                    );
        }

        /*
         * Find all tenants
         */
        List<Party> tenants =
                parties.stream()
                        .filter(party ->
                                "TENANT".equals(
                                        party.getPartyType()
                                )
                        )
                        .toList();

        /*
         * Check every tenant signature
         */
        for (Party tenant : tenants) {

            boolean tenantSigned =
                    signatures.stream()
                            .anyMatch(signature ->
                                    signature
                                            .getPartyId()
                                            .equals(
                                                    tenant.getId()
                                            )
                                            &&
                                            "TENANT".equals(
                                                    signature
                                                            .getSignerType()
                                            )
                            );

            if (!tenantSigned) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Tenant signature is required before generating the final agreement."
                        );
            }
        }

        try {

            /*
             * Generate PDF
             */
            byte[] pdf =
                    pdfService.generatePdf(
                            applicationId
                    );

            /*
             * Mark application completed
             */
            application.setStatus(
                    "COMPLETED"
            );

            applicationRepository.save(
                    application
            );

            /*
             * Send PDF to homeowner
             */
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

                emailService.sendCompletedAgreement(
                        homeowner.getEmail(),
                        homeowner.getName(),
                        pdf
                );
            }

            /*
             * Send PDF to every tenant
             */
            for (Party tenant : tenants) {

                if (tenant.getEmail() != null &&
                        !tenant.getEmail().isBlank()) {

                    emailService.sendCompletedAgreement(
                            tenant.getEmail(),
                            tenant.getName(),
                            pdf
                    );
                }
            }

            /*
             * Return PDF to browser
             */
            return ResponseEntity
                    .ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=rental-agreement-"
                                    + applicationId
                                    + ".pdf"
                    )
                    .contentType(
                            MediaType.APPLICATION_PDF
                    )
                    .body(pdf);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Unable to generate or email the final rental agreement."
                    );
        }
    }
}