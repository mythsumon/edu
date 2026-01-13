package com.itwizard.swaedu.modules.region.repository;

import com.itwizard.swaedu.modules.region.entity.RegionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegionRepository extends JpaRepository<RegionEntity, Long> {
    Optional<RegionEntity> findByName(String name);
    boolean existsByName(String name);

    @Query("SELECT r FROM RegionEntity r WHERE r.zoneId = :zoneId")
    List<RegionEntity> findByZoneId(@Param("zoneId") Long zoneId);

    boolean existsByNameAndZoneId(String name, Long zoneId);
}
