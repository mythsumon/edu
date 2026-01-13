package com.itwizard.swaedu.modules.auth.entity;

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

    @Column(nullable = false)
    private String name;

    @Column
    private String email;

    @Column
    private String phone;

    @Column
    private String gender;

    @Column
    private LocalDate dob;

    @Column
    private String city;

    @Column
    private String street;

    @Column(name = "detail_address")
    private String detailAddress;
}
