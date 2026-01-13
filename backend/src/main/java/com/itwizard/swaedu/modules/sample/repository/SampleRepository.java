package com.itwizard.swaedu.modules.sample.repository;

import com.itwizard.swaedu.modules.sample.entity.SampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SampleRepository extends JpaRepository<SampleEntity, Long> {
    // Add custom query methods here

    //user sql fu
    //admin sql

}

