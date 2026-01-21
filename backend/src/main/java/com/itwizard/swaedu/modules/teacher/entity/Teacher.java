package com.itwizard.swaedu.modules.teacher.entity;

import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @MapsId
    private User user;

    @Column(name = "teacher_id", unique = true)
    private String teacherId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column
    private String email;

    @Column
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", foreignKey = @ForeignKey(name = "fk_teachers_status"))
    private MasterCodeEntity status;

    @Column(name = "status_id", insertable = false, updatable = false)
    private Long statusId;

    @Column(name = "profile_photo")
    private String profilePhoto;
}
