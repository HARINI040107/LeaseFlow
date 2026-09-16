package com.rentallease.rental_lease_backend.controller;

import com.rentallease.rental_lease_backend.entity.Party;
import com.rentallease.rental_lease_backend.service.PartyService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications/{applicationId}/parties")
public class PartyController {

    private final PartyService partyService;

    public PartyController(PartyService partyService) {
        this.partyService = partyService;
    }

    @PostMapping
    public Party addParty(
            @PathVariable UUID applicationId,
            @RequestBody Party party) {

        return partyService.addParty(
                applicationId,
                party
        );
    }

    @GetMapping
    public List<Party> getParties(
            @PathVariable UUID applicationId) {

        return partyService.getParties(
                applicationId
        );
    }

    @PutMapping("/{partyId}")
    public ResponseEntity<Party> updateParty(
            @PathVariable UUID applicationId,
            @PathVariable UUID partyId,
            @RequestBody Party party) {

        Party updatedParty =
                partyService.updateParty(
                        partyId,
                        party
                );

        return ResponseEntity.ok(updatedParty);
    }
}