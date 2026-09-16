package com.rentallease.rental_lease_backend.controller;

import com.rentallease.rental_lease_backend.entity.ApplicationSection;
import com.rentallease.rental_lease_backend.service.ApplicationSectionService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/applications/{applicationId}/sections")
public class ApplicationSectionController {

    private final ApplicationSectionService sectionService;

    public ApplicationSectionController(
            ApplicationSectionService sectionService) {
        this.sectionService = sectionService;
    }

    @PutMapping("/{sectionNumber}")
    public ApplicationSection saveSection(
            @PathVariable UUID applicationId,
            @PathVariable String sectionNumber,
            @RequestBody String sectionData,
            @RequestParam(defaultValue = "false") boolean completed) {

        return sectionService.saveSection(
                applicationId,
                sectionNumber,
                sectionData,
                completed
        );
    }

    @GetMapping("/{sectionNumber}")
    public ApplicationSection getSection(
            @PathVariable UUID applicationId,
            @PathVariable String sectionNumber) {

        return sectionService.getSection(
                applicationId,
                sectionNumber
        );
    }
}