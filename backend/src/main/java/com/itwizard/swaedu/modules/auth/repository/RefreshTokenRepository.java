package com.itwizard.swaedu.modules.auth.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.itwizard.swaedu.modules.auth.entity.RefreshToken;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

  Optional<RefreshToken> findByLookupHash(String lookupHash);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
          UPDATE RefreshToken t
             SET t.revoked = true,
                 t.revokedAt = :now,
                 t.replacedById = :newTokenId
           WHERE t.id = :oldTokenId
      """)
  void rotateToken(Long oldTokenId, Long newTokenId, Instant now);

  @Modifying
  @Query("""
          DELETE FROM RefreshToken t
          WHERE t.expiresAt < :now
             OR t.revoked = true
      """)
  int deleteExpiredAndRevoked(Instant now);
}
