package com.itwizard.swaedu.modules.travelallowance.entity;

import com.itwizard.swaedu.modules.instructor.entity.Instructor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Instructor Daily Travel Entity
 * Represents a single day's travel record for an instructor
 * Unique constraint: (instructor_id, travel_date)
 */
@Data
@Entity
@Table(name = "instructor_daily_travel", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"instructor_id", "travel_date"}))
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDailyTravel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_daily_travel_instructor"))
    private Instructor instructor;

    @Column(name = "instructor_id", insertable = false, updatable = false)
    private Long instructorId;

    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @Column(name = "work_month", nullable = false, length = 7)  // YYYY-MM format
    private String workMonth;

    @Column(name = "total_distance_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDistanceKm;

    @Column(name = "travel_fee_amount_krw", nullable = false)
    private Integer travelFeeAmountKrw;

    @Column(name = "map_snapshot_url", length = 1000)
    private String mapSnapshotUrl;  // NOT NULL once finalized, but nullable for DRAFT

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TravelStatus status = TravelStatus.DRAFT;

    @OneToMany(mappedBy = "dailyTravel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("seq ASC")
    private List<TravelWaypoint> waypoints = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (workMonth == null && travelDate != null) {
            workMonth = travelDate.toString().substring(0, 7);  // YYYY-MM
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TravelStatus {
        DRAFT,  // Missing address or geocode failed
        FINAL   // All data complete, map snapshot generated
    }
}
