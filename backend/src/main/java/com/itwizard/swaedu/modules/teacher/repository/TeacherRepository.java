package com.itwizard.swaedu.modules.teacher.repository;

import com.itwizard.swaedu.modules.teacher.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);

    @Query("SELECT t FROM Teacher t JOIN t.user u " +
           "WHERE (:q IS NULL OR :q = '' OR " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(t.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(t.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Teacher> search(@Param("q") String q, Pageable pageable);

    // Stream all teachers for export (with search filter, no pagination)
    @Query("""
        SELECT DISTINCT t FROM Teacher t
        JOIN t.user u
        WHERE (:q IS NULL OR :q = '' OR 
               LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(t.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(COALESCE(t.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')))
        ORDER BY t.userId
        """)
    Stream<Teacher> streamForExport(@Param("q") String q);
}
