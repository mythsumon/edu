package com.itwizard.swaedu.modules.institutions.entity;

import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import com.itwizard.swaedu.modules.teacher.entity.Teacher;
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

    @Column(name = "institution_id", length = 255, unique = true)
    private String institutionId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", foreignKey = @ForeignKey(name = "fk_institutions_district"))
    private MasterCodeEntity district;

    @Column(name = "district_id", insertable = false, updatable = false)
    private Long districtId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", foreignKey = @ForeignKey(name = "fk_institutions_zone"))
    private MasterCodeEntity zone;

    @Column(name = "zone_id", insertable = false, updatable = false)
    private Long zoneId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", foreignKey = @ForeignKey(name = "fk_institutions_region"))
    private MasterCodeEntity region;

    @Column(name = "region_id", insertable = false, updatable = false)
    private Long regionId;

    @Column(length = 255)
    private String street;

    @Column(length = 500)
    private String address;

    @Column(name = "institution_lat", precision = 10, scale = 7)
    private java.math.BigDecimal institutionLat;

    @Column(name = "institution_lng", precision = 10, scale = 7)
    private java.math.BigDecimal institutionLng;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_category_id", foreignKey = @ForeignKey(name = "fk_institutions_major_category"))
    private MasterCodeEntity majorCategory;

    @Column(name = "major_category_id", insertable = false, updatable = false)
    private Long majorCategoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_one_id", foreignKey = @ForeignKey(name = "fk_institutions_category_one"))
    private MasterCodeEntity categoryOne;

    @Column(name = "category_one_id", insertable = false, updatable = false)
    private Long categoryOneId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_two_id", foreignKey = @ForeignKey(name = "fk_institutions_category_two"))
    private MasterCodeEntity categoryTwo;

    @Column(name = "category_two_id", insertable = false, updatable = false)
    private Long categoryTwoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classification_id", foreignKey = @ForeignKey(name = "fk_institutions_classification"))
    private MasterCodeEntity classification;

    @Column(name = "classification_id", insertable = false, updatable = false)
    private Long classificationId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", foreignKey = @ForeignKey(name = "fk_institutions_teacher"))
    private Teacher teacher;

    @Column(name = "teacher_id", insertable = false, updatable = false)
    private Long teacherId;

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
