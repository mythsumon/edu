package com.itwizard.swaedu.modules.staff.entity;

import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "staff")
public class Staff {

    @Id
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @MapsId
    private User user;

    @Column(name = "staff_id", unique = true)
    private String staffId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column
    private String email;

    @Column
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", foreignKey = @ForeignKey(name = "fk_staff_status"))
    private MasterCodeEntity status;

    @Column(name = "status_id", insertable = false, updatable = false)
    private Long statusId;

    @Column(name = "profile_photo")
    private String profilePhoto;
}
