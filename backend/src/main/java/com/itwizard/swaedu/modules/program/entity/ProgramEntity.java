package com.itwizard.swaedu.modules.program.entity;

import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "programs")
public class ProgramEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "program_id", length = 255, unique = true)
    private String programId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_part_id", nullable = false, foreignKey = @ForeignKey(name = "fk_programs_session_part"))
    private MasterCodeEntity sessionPart;

    @Column(name = "session_part_id", insertable = false, updatable = false)
    private Long sessionPartId;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false, foreignKey = @ForeignKey(name = "fk_programs_status"))
    private MasterCodeEntity status;

    @Column(name = "status_id", insertable = false, updatable = false)
    private Long statusId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_type_id", foreignKey = @ForeignKey(name = "fk_programs_program_type"))
    private MasterCodeEntity programType;

    @Column(name = "program_type_id", insertable = false, updatable = false)
    private Long programTypeId;

    @Column(columnDefinition = "TEXT")
    private String notes;

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
