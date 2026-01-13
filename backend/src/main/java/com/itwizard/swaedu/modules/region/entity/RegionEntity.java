package com.itwizard.swaedu.modules.region.entity;

import com.itwizard.swaedu.modules.zone.entity.ZoneEntity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "regions")
public class RegionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false, foreignKey = @ForeignKey(name = "fk_regions_zone"))
    private ZoneEntity zone;

    @Column(name = "zone_id", insertable = false, updatable = false)
    private Long zoneId;
}
