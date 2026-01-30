package com.itwizard.swaedu.modules.travelallowance.service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Map Snapshot Service Interface
 * Generates map snapshot images showing route from home to waypoints and back
 */
public interface MapSnapshotService {

    /**
     * Generate route snapshot image
     * 
     * @param homeLat Home latitude
     * @param homeLng Home longitude
     * @param homeAddress Home address (for display)
     * @param waypoints List of waypoints (institution coordinates and addresses)
     * @param returnHome Whether to return to home (true for round trip)
     * @return URL to the generated map snapshot image
     */
    String generateRouteSnapshot(
            BigDecimal homeLat,
            BigDecimal homeLng,
            String homeAddress,
            List<Waypoint> waypoints,
            boolean returnHome
    );

    /**
     * Waypoint data structure
     */
    record Waypoint(
            BigDecimal lat,
            BigDecimal lng,
            String address,
            String name
    ) {}
}
