package com.itwizard.swaedu.modules.training.entity;

import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.program.entity.ProgramEntity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "trainings")
public class TrainingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "training_id", length = 255, unique = true)
    private String trainingId;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false, foreignKey = @ForeignKey(name = "fk_training_program"))
    private ProgramEntity program;

    @Column(name = "program_id", insertable = false, updatable = false)
    private Long programId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false, foreignKey = @ForeignKey(name = "fk_training_institution"))
    private InstitutionEntity institution;

    @Column(name = "institution_id", insertable = false, updatable = false)
    private Long institutionId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(length = 50)
    private String grade;

    @Column(name = "class", length = 50)
    private String classInfo;

    @Column(name = "number_students")
    private Integer numberStudents;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_delete", nullable = false)
    private Boolean isDelete = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
