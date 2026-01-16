package com.itwizard.swaedu.modules.admin.repository;

import com.itwizard.swaedu.modules.admin.entity.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUserId(Long userId);

    @Query("SELECT a FROM Admin a JOIN a.user u " +
           "WHERE (:q IS NULL OR :q = '' OR " +
           "LOWER(a.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(a.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Admin> search(@Param("q") String q, Pageable pageable);
}
