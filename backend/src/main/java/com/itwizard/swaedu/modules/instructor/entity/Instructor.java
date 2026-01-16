package com.itwizard.swaedu.modules.instructor.entity;

import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import com.itwizard.swaedu.modules.region.entity.RegionEntity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "instructors")
public class Instructor {

    @Id
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @MapsId
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column
    private String email;

    @Column
    private String phone;

    @Column
    private String gender;

    @Column
    private LocalDate dob;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", foreignKey = @ForeignKey(name = "fk_instructors_region"))
    private RegionEntity region;

    @Column(name = "region_id", insertable = false, updatable = false)
    private Long regionId;

    @Column
    private String city;

    @Column
    private String street;

    @Column(name = "detail_address")
    private String detailAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", foreignKey = @ForeignKey(name = "fk_instructors_status"))
    private MasterCodeEntity status;

    @Column(name = "status_id", insertable = false, updatable = false)
    private Long statusId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classification_id", foreignKey = @ForeignKey(name = "fk_instructors_classification"))
    private MasterCodeEntity classification;

    @Column(name = "classification_id", insertable = false, updatable = false)
    private Long classificationId;

    @Column
    private String affiliation;

    @Column
    private String signature;

    @Column(name = "profile_photo")
    private String profilePhoto;
}
