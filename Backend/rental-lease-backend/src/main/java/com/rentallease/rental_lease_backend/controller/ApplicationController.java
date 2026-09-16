package com.rentallease.rental_lease_backend.controller;

import com.rentallease.rental_lease_backend.entity.Application;
import com.rentallease.rental_lease_backend.repository.ApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;

    public ApplicationController(
            ApplicationRepository applicationRepository) {

        this.applicationRepository =
                applicationRepository;
    }

    @PostMapping
    public Application createApplication(
            @RequestBody Application application) {

        application.setStatus("DRAFT");

        return applicationRepository.save(
                application
        );
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<Application> getApplication(
            @PathVariable UUID applicationId) {

        return applicationRepository
                .findById(applicationId)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable UUID applicationId,
            @RequestParam String status) {

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElse(null);

        if (application == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        application.setStatus(status);

        return ResponseEntity.ok(
                applicationRepository.save(application)
        );
    }
}