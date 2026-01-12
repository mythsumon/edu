package com.itwizard.swaedu.modules.auth.repository;

import com.itwizard.swaedu.modules.auth.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    Optional<Instructor> findByUserId(Long userId);
    boolean existsByEmail(String email);
}
