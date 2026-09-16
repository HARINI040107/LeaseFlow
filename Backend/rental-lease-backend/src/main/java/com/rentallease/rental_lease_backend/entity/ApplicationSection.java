package com.rentallease.rental_lease_backend.entity;

import jakarta.persistence.*;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "application_sections")
public class ApplicationSection {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "application_id", nullable = false)
    private UUID applicationId;

    @Column(name = "section_number", nullable = false)
    private String sectionNumber;

    @JdbcTypeCode(SqlTypes.JSON)
@Column(name = "section_data", columnDefinition = "jsonb")
private String sectionData;
    private boolean completed = false;

    public UUID getId() {
        return id;
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public String getSectionNumber() {
        return sectionNumber;
    }

    public void setSectionNumber(String sectionNumber) {
        this.sectionNumber = sectionNumber;
    }

    public String getSectionData() {
        return sectionData;
    }

    public void setSectionData(String sectionData) {
        this.sectionData = sectionData;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
