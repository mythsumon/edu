package com.itwizard.swaedu.modules.travelallowance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Travel Allowance Policy Entity
 * Configurable distance-based policy table for travel allowance calculation
 */
@Data
@Entity
@Table(name = "travel_allowance_policy")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelAllowancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "min_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal minKm;

    @Column(name = "max_km", precision = 10, scale = 2)
    private BigDecimal maxKm;  // NULL means infinity

    @Column(name = "amount_krw", nullable = false)
    private Integer amountKrw;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if distance falls within this policy range
     */
    public boolean matches(BigDecimal distanceKm) {
        if (distanceKm.compareTo(minKm) < 0) {
            return false;
        }
        if (maxKm == null) {
            return true;  // Infinity
        }
        return distanceKm.compareTo(maxKm) < 0;
    }
}
