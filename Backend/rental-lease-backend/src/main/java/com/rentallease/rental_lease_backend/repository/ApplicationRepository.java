package com.rentallease.rental_lease_backend.repository;

import com.rentallease.rental_lease_backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
}