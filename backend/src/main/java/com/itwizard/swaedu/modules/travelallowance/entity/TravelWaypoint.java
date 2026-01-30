package com.itwizard.swaedu.modules.travelallowance.entity;

import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.training.entity.TrainingEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Travel Waypoint Entity
 * Represents a point in the daily travel route
 * Sequence: 0 = home, 1+ = institutions in order
 */
@Data
@Entity
@Table(name = "instructor_daily_travel_waypoint")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelWaypoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_travel_id", nullable = false, foreignKey = @ForeignKey(name = "fk_waypoint_daily_travel"))
    private InstructorDailyTravel dailyTravel;

    @Column(name = "daily_travel_id", insertable = false, updatable = false)
    private Long dailyTravelId;

    @Column(name = "seq", nullable = false)
    private Integer seq;  // Sequence order: 0 = home, 1 = first institution, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", foreignKey = @ForeignKey(name = "fk_waypoint_institution"))
    private InstitutionEntity institution;

    @Column(name = "institution_id", insertable = false, updatable = false)
    private Long institutionId;

    @Column(name = "institution_name", length = 255)
    private String institutionName;  // For home: NULL or 'HOME'

    @Column(name = "institution_address", length = 500)
    private String institutionAddress;

    @Column(name = "lat", precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(name = "lng", precision = 10, scale = 7)
    private BigDecimal lng;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", foreignKey = @ForeignKey(name = "fk_waypoint_training"))
    private TrainingEntity training;

    @Column(name = "training_id", insertable = false, updatable = false)
    private Long trainingId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Check if this is the home waypoint
     */
    public boolean isHome() {
        return seq == 0 || institutionId == null;
    }
}
