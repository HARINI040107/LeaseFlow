package com.rentallease.rental_lease_backend.controller;

import com.rentallease.rental_lease_backend.entity.Signature;
import com.rentallease.rental_lease_backend.service.SignatureService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications/{applicationId}/signatures")
public class SignatureController {

    private final SignatureService signatureService;

    public SignatureController(
            SignatureService signatureService) {

        this.signatureService =
                signatureService;
    }

    @PostMapping
    public ResponseEntity<Signature> saveSignature(
            @PathVariable UUID applicationId,
            @RequestBody SignatureRequest request) {

        if (request.getPartyId() == null ||
                request.getSignatureData() == null ||
                request.getSignatureData().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        if (request.getSignerType() == null ||
                request.getSignerType().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        String signerType =
                request.getSignerType()
                        .toUpperCase();

        if (!signerType.equals("HOMEOWNER") &&
                !signerType.equals("TENANT")) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        Signature signature =
                signatureService.saveSignature(
                        applicationId,
                        request.getPartyId(),
                        request.getSignatureData(),
                        signerType
                );

        return ResponseEntity.ok(signature);
    }

    @GetMapping
    public ResponseEntity<List<Signature>>
    getApplicationSignatures(
            @PathVariable UUID applicationId) {

        return ResponseEntity.ok(
                signatureService
                        .getApplicationSignatures(
                                applicationId
                        )
        );
    }

    @GetMapping("/{partyId}")
    public ResponseEntity<Signature> getSignature(
            @PathVariable UUID applicationId,
            @PathVariable UUID partyId) {

        Signature signature =
                signatureService.getSignature(
                        applicationId,
                        partyId
                );

        if (signature == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(signature);
    }

    @GetMapping("/type/{signerType}")
    public ResponseEntity<List<Signature>>
    getSignaturesByType(
            @PathVariable UUID applicationId,
            @PathVariable String signerType) {

        return ResponseEntity.ok(
                signatureService
                        .getSignaturesByType(
                                applicationId,
                                signerType.toUpperCase()
                        )
        );
    }

    public static class SignatureRequest {

        private UUID partyId;
        private String signatureData;
        private String signerType;

        public UUID getPartyId() {
            return partyId;
        }

        public void setPartyId(
                UUID partyId) {

            this.partyId = partyId;
        }

        public String getSignatureData() {
            return signatureData;
        }

        public void setSignatureData(
                String signatureData) {

            this.signatureData =
                    signatureData;
        }

        public String getSignerType() {
            return signerType;
        }

        public void setSignerType(
                String signerType) {

            this.signerType =
                    signerType;
        }
    }
}