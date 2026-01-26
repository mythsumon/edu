package com.edu.repository;

import com.edu.entity.AdminRegionArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRegionAreaRepository extends JpaRepository<AdminRegionArea, Long> {
    Optional<AdminRegionArea> findByAreaCode(String areaCode);

    @Query("SELECT a FROM AdminRegionArea a WHERE a.areaCode = :areaCode AND a.region.id != :excludeRegionId")
    List<AdminRegionArea> findByAreaCodeExcludingRegion(@Param("areaCode") String areaCode, @Param("excludeRegionId") Long excludeRegionId);

    List<AdminRegionArea> findByRegionId(Long regionId);

    void deleteByRegionId(Long regionId);
}
