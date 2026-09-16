package com.rentallease.rental_lease_backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "homeowner_id", nullable = false)
    private UUID homeownerId;

    @Column(nullable = false)
    private String status = "DRAFT";

    public UUID getId() {
        return id;
    }

    public UUID getHomeownerId() {
        return homeownerId;
    }

    public void setHomeownerId(UUID homeownerId) {
        this.homeownerId = homeownerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
