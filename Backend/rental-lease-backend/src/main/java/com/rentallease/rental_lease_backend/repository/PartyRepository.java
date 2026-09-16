package com.rentallease.rental_lease_backend.repository;

import com.rentallease.rental_lease_backend.entity.Party;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PartyRepository extends JpaRepository<Party, UUID> {

    List<Party> findByApplicationId(UUID applicationId);
}