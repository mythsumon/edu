package com.itwizard.swaedu.modules.staff.repository;

import com.itwizard.swaedu.modules.staff.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByUserId(Long userId);
    
    Optional<Staff> findByUserUsername(String username);
}
