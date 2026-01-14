package com.itwizard.swaedu.modules.instructor.repository;

import com.itwizard.swaedu.modules.auth.entity.Instructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    Optional<Instructor> findByUserId(Long userId);

    boolean existsByEmail(String email);

    @Query("SELECT i FROM Instructor i JOIN i.user u " +
           "WHERE (:q IS NULL OR :q = '' OR " +
           "LOWER(i.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(i.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(i.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Instructor> search(@Param("q") String q, Pageable pageable);
}
