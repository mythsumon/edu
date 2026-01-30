package com.itwizard.swaedu.modules.travelallowance.repository;

import com.itwizard.swaedu.modules.travelallowance.entity.InstructorDailyTravel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorDailyTravelRepository extends JpaRepository<InstructorDailyTravel, Long> {

    /**
     * Find by instructor and date
     */
    Optional<InstructorDailyTravel> findByInstructorIdAndTravelDate(Long instructorId, LocalDate travelDate);

    /**
     * Find all daily travels for an instructor in a date range
     */
    List<InstructorDailyTravel> findByInstructorIdAndTravelDateBetween(
            Long instructorId, LocalDate from, LocalDate to);

    /**
     * Find all daily travels for an instructor in a specific month
     */
    @Query("SELECT dt FROM InstructorDailyTravel dt " +
           "WHERE dt.instructorId = :instructorId " +
           "AND dt.workMonth = :workMonth " +
           "ORDER BY dt.travelDate ASC")
    List<InstructorDailyTravel> findByInstructorIdAndWorkMonth(
            @Param("instructorId") Long instructorId, 
            @Param("workMonth") String workMonth);

    /**
     * Calculate monthly total travel expense for an instructor
     */
    @Query("SELECT COALESCE(SUM(dt.travelFeeAmountKrw), 0) FROM InstructorDailyTravel dt " +
           "WHERE dt.instructorId = :instructorId " +
           "AND dt.workMonth = :workMonth " +
           "AND dt.status = 'FINAL'")
    Integer calculateMonthlyTotal(@Param("instructorId") Long instructorId, 
                                  @Param("workMonth") String workMonth);

    /**
     * Find all daily travels by status
     */
    List<InstructorDailyTravel> findByStatus(InstructorDailyTravel.TravelStatus status);

    /**
     * Check if daily travel exists for instructor and date
     */
    boolean existsByInstructorIdAndTravelDate(Long instructorId, LocalDate travelDate);
}
