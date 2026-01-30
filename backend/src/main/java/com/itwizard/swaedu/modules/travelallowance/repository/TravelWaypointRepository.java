package com.itwizard.swaedu.modules.travelallowance.repository;

import com.itwizard.swaedu.modules.travelallowance.entity.TravelWaypoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelWaypointRepository extends JpaRepository<TravelWaypoint, Long> {

    /**
     * Find all waypoints for a daily travel record, ordered by sequence
     */
    List<TravelWaypoint> findByDailyTravelIdOrderBySeqAsc(Long dailyTravelId);

    /**
     * Delete all waypoints for a daily travel record
     */
    void deleteByDailyTravelId(Long dailyTravelId);
}
