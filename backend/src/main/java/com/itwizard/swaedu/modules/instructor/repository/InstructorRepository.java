package com.itwizard.swaedu.modules.instructor.repository;

import com.itwizard.swaedu.modules.instructor.entity.Instructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    Optional<Instructor> findByUserId(Long userId);

    boolean existsByEmail(String email);

    @Query("SELECT i FROM Instructor i JOIN i.user u " +
           "WHERE (:q IS NULL OR :q = '' OR " +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(i.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(i.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:regionIds IS NULL OR i.regionId IN :regionIds) " +
           "AND (:classificationIds IS NULL OR i.classificationId IN :classificationIds) " +
           "AND (:statusIds IS NULL OR i.statusId IN :statusIds)")
    Page<Instructor> search(
            @Param("q") String q,
            @Param("regionIds") List<Long> regionIds,
            @Param("classificationIds") List<Long> classificationIds,
            @Param("statusIds") List<Long> statusIds,
            Pageable pageable);
}
