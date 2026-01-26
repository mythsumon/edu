package com.edu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_region_area", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"region_id", "area_code"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegionArea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private AdminRegion region;

    @Column(nullable = false, length = 10)
    private String areaCode;

    @Column(nullable = false, length = 100)
    private String areaName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
