package com.rentallease.rental_lease_backend.service;

import com.rentallease.rental_lease_backend.entity.Party;
import com.rentallease.rental_lease_backend.repository.PartyRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
public class PartyService {

    private final PartyRepository partyRepository;

    public PartyService(PartyRepository partyRepository) {
        this.partyRepository = partyRepository;
    }

    public Party addParty(UUID applicationId, Party party) {

        party.setApplicationId(applicationId);

        if (party.getDateOfBirth() != null) {

            int age = Period.between(
                    party.getDateOfBirth(),
                    LocalDate.now()
            ).getYears();

            if (age >= 18) {
                party.setPartyType("TENANT");
            } else {
                party.setPartyType("OCCUPANT");
            }
        }

        return partyRepository.save(party);
    }

    public Party updateParty(
            UUID partyId,
            Party updatedParty) {

        Party existingParty =
                partyRepository.findById(partyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Party not found"
                                ));

        existingParty.setName(
                updatedParty.getName()
        );

        existingParty.setEmail(
                updatedParty.getEmail()
        );

        existingParty.setDateOfBirth(
                updatedParty.getDateOfBirth()
        );

        if (existingParty.getDateOfBirth() != null) {

            int age = Period.between(
                    existingParty.getDateOfBirth(),
                    LocalDate.now()
            ).getYears();

            if (age >= 18) {
                existingParty.setPartyType("TENANT");
            } else {
                existingParty.setPartyType("OCCUPANT");
            }
        }

        return partyRepository.save(existingParty);
    }

    public List<Party> getParties(UUID applicationId) {

        return partyRepository
                .findByApplicationId(applicationId);
    }

    public Party getParty(UUID partyId) {

        return partyRepository
                .findById(partyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Party not found"
                        ));
    }
}