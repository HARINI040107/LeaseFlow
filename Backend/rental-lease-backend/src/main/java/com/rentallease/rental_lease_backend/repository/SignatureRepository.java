package com.rentallease.rental_lease_backend.repository;

import com.rentallease.rental_lease_backend.entity.Signature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SignatureRepository
        extends JpaRepository<Signature, UUID> {

    Optional<Signature>
    findByApplicationIdAndPartyId(
            UUID applicationId,
            UUID partyId
    );

    List<Signature>
    findByApplicationId(
            UUID applicationId
    );

    List<Signature>
    findByApplicationIdAndSignerType(
            UUID applicationId,
            String signerType
    );
}
