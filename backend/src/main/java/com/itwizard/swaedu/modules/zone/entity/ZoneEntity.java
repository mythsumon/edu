package com.itwizard.swaedu.modules.zone.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "zones")
public class ZoneEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
}
