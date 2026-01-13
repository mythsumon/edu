package com.itwizard.swaedu.modules.zone.repository;

import com.itwizard.swaedu.modules.zone.entity.ZoneEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<ZoneEntity, Long> {
    Optional<ZoneEntity> findByName(String name);
    boolean existsByName(String name);
}
