package com.rentallease.rental_lease_backend.service;

import com.rentallease.rental_lease_backend.entity.Signature;
import com.rentallease.rental_lease_backend.repository.SignatureRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SignatureService {

    private final SignatureRepository signatureRepository;

    public SignatureService(
            SignatureRepository signatureRepository) {

        this.signatureRepository =
                signatureRepository;
    }

    public Signature saveSignature(
            UUID applicationId,
            UUID partyId,
            String signatureData,
            String signerType) {

        Signature signature =
                signatureRepository
                        .findByApplicationIdAndPartyId(
                                applicationId,
                                partyId
                        )
                        .orElse(new Signature());

        signature.setApplicationId(
                applicationId
        );

        signature.setPartyId(
                partyId
        );

        signature.setSignatureData(
                signatureData
        );

        signature.setSignerType(
                signerType
        );

        signature.setSignedAt(
                LocalDateTime.now()
        );

        return signatureRepository.save(
                signature
        );
    }

    public Signature getSignature(
            UUID applicationId,
            UUID partyId) {

        return signatureRepository
                .findByApplicationIdAndPartyId(
                        applicationId,
                        partyId
                )
                .orElse(null);
    }

    public List<Signature> getApplicationSignatures(
            UUID applicationId) {

        return signatureRepository
                .findByApplicationId(
                        applicationId
                );
    }

    public List<Signature> getSignaturesByType(
            UUID applicationId,
            String signerType) {

        return signatureRepository
                .findByApplicationIdAndSignerType(
                        applicationId,
                        signerType
                );
    }
}