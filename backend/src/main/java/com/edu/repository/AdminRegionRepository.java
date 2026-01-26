package com.edu.repository;

import com.edu.entity.AdminRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRegionRepository extends JpaRepository<AdminRegion, Long> {
    Optional<AdminRegion> findByName(String name);

    @Query("SELECT r FROM AdminRegion r ORDER BY r.id ASC")
    List<AdminRegion> findAllOrderById();
}
