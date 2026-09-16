package com.rentallease.rental_lease_backend.service;

import com.rentallease.rental_lease_backend.entity.ApplicationSection;
import com.rentallease.rental_lease_backend.repository.ApplicationSectionRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ApplicationSectionService {

    private final ApplicationSectionRepository repository;

    public ApplicationSectionService(ApplicationSectionRepository repository) {
        this.repository = repository;
    }

    public ApplicationSection saveSection(
            UUID applicationId,
            String sectionNumber,
            String sectionData,
            boolean completed) {

        ApplicationSection section =
                repository.findByApplicationIdAndSectionNumber(
                        applicationId, sectionNumber
                ).orElse(new ApplicationSection());

        section.setApplicationId(applicationId);
        section.setSectionNumber(sectionNumber);
        section.setSectionData(sectionData);
        section.setCompleted(completed);

        return repository.save(section);
    }

    public ApplicationSection getSection(
            UUID applicationId,
            String sectionNumber) {

        return repository.findByApplicationIdAndSectionNumber(
                applicationId, sectionNumber
        ).orElse(null);
    }
}