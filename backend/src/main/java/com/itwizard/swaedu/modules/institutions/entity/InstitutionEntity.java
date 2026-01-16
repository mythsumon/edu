package com.itwizard.swaedu.modules.institutions.entity;

import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "institutions")
public class InstitutionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_type_id", foreignKey = @ForeignKey(name = "fk_institutions_institution_type"))
    private MasterCodeEntity institutionType;

    @Column(name = "institution_type_id", insertable = false, updatable = false)
    private Long institutionTypeId;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", foreignKey = @ForeignKey(name = "fk_institutions_region"))
    private MasterCodeEntity region;

    @Column(name = "region_id", insertable = false, updatable = false)
    private Long regionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "education_type_id", foreignKey = @ForeignKey(name = "fk_institutions_education_type"))
    private MasterCodeEntity educationType;

    @Column(name = "education_type_id", insertable = false, updatable = false)
    private Long educationTypeId;

    @Column(length = 255)
    private String street;

    @Column(name = "additional_address", length = 500)
    private String additionalAddress;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "in_charge_person_id")
    private Long inChargePersonId;

    @Column(length = 500)
    private String signature;

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
