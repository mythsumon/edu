package com.itwizard.swaedu.modules.sample.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "samples")
public class SampleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

}

