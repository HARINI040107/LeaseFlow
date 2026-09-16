package com.rentallease.rental_lease_backend.repository;

import com.rentallease.rental_lease_backend.entity.ApplicationSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ApplicationSectionRepository
        extends JpaRepository<ApplicationSection, UUID> {

    Optional<ApplicationSection> findByApplicationIdAndSectionNumber(
            UUID applicationId,
            String sectionNumber
    );
}
