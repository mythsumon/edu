package com.itwizard.swaedu.modules.travelallowance.repository;

import com.itwizard.swaedu.modules.travelallowance.entity.TravelAllowancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TravelAllowancePolicyRepository extends JpaRepository<TravelAllowancePolicy, Long> {

    /**
     * Find active policies
     */
    List<TravelAllowancePolicy> findByIsActiveTrueOrderByMinKmAsc();

    /**
     * Find policy that matches the given distance
     * Returns the policy where minKm <= distance < maxKm (or maxKm is NULL)
     */
    @Query("SELECT p FROM TravelAllowancePolicy p " +
           "WHERE p.isActive = true " +
           "AND p.minKm <= :distance " +
           "AND (p.maxKm IS NULL OR p.maxKm > :distance) " +
           "AND (p.validFrom IS NULL OR p.validFrom <= :date) " +
           "AND (p.validTo IS NULL OR p.validTo >= :date) " +
           "ORDER BY p.minKm DESC")
    Optional<TravelAllowancePolicy> findMatchingPolicy(@Param("distance") BigDecimal distance, 
                                                         @Param("date") LocalDate date);
}
