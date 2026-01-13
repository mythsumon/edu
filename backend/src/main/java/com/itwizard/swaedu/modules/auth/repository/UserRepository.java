package com.itwizard.swaedu.modules.auth.repository;

import com.itwizard.swaedu.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findOptionalByUsername(String username);
    boolean existsByUsername(String username);
}

