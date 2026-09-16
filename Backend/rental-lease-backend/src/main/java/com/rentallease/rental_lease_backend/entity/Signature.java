package com.rentallease.rental_lease_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "signatures")
public class Signature {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(
        name = "application_id",
        nullable = false
    )
    private UUID applicationId;

    @Column(
        name = "party_id",
        nullable = false
    )
    private UUID partyId;

    @Column(
        name = "signature_data",
        nullable = false,
        columnDefinition = "TEXT"
    )
    private String signatureData;

    @Column(name = "signer_type")
    private String signerType;

    @Column(name = "signed_at")
    private LocalDateTime signedAt =
            LocalDateTime.now();

    public UUID getId() {
        return id;
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(
            UUID applicationId) {

        this.applicationId = applicationId;
    }

    public UUID getPartyId() {
        return partyId;
    }

    public void setPartyId(UUID partyId) {
        this.partyId = partyId;
    }

    public String getSignatureData() {
        return signatureData;
    }

    public void setSignatureData(
            String signatureData) {

        this.signatureData = signatureData;
    }

    public String getSignerType() {
        return signerType;
    }

    public void setSignerType(
            String signerType) {

        this.signerType = signerType;
    }

    public LocalDateTime getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(
            LocalDateTime signedAt) {

        this.signedAt = signedAt;
    }
}