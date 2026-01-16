package com.itwizard.swaedu.modules.admin.entity;

import com.itwizard.swaedu.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "admins")
public class Admin {

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

    @Column(name = "profile_photo")
    private String profilePhoto;
}
