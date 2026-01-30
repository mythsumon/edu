package com.itwizard.swaedu.modules.travelallowance.service;

import java.math.BigDecimal;

/**
 * Distance Calculation Service Interface
 * Calculates shortest route distance between two points
 */
public interface DistanceCalculationService {

    /**
     * Calculate shortest route distance between two points (in km)
     * 
     * @param fromLat Starting point latitude
     * @param fromLng Starting point longitude
     * @param toLat Destination latitude
     * @param toLng Destination longitude
     * @return Distance in kilometers
     */
    BigDecimal calculateDistance(BigDecimal fromLat, BigDecimal fromLng, 
                                  BigDecimal toLat, BigDecimal toLng);

    /**
     * Calculate total distance for a route with multiple waypoints
     * Route: point1 → point2 → point3 → ... → pointN
     * 
     * @param waypoints List of waypoints (lat, lng)
     * @return Total distance in kilometers
     */
    BigDecimal calculateRouteDistance(List<Waypoint> waypoints);

    /**
     * Waypoint data structure
     */
    record Waypoint(BigDecimal lat, BigDecimal lng) {}
}
