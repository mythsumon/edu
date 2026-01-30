package com.itwizard.swaedu.modules.travelallowance.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Distance Calculation Service Implementation
 * 
 * Uses Haversine formula for straight-line distance calculation.
 * 
 * TODO: In final implementation, integrate with Kakao Maps Directions API
 * to get actual shortest route distance (not straight-line).
 */
@Slf4j
@Service
public class DistanceCalculationServiceImpl implements DistanceCalculationService {

    private static final BigDecimal EARTH_RADIUS_KM = new BigDecimal("6371.0");

    @Override
    public BigDecimal calculateDistance(BigDecimal fromLat, BigDecimal fromLng, 
                                         BigDecimal toLat, BigDecimal toLng) {
        if (fromLat == null || fromLng == null || toLat == null || toLng == null) {
            throw new IllegalArgumentException("All coordinates must be provided");
        }

        // Haversine formula for great-circle distance
        BigDecimal lat1Rad = toRadians(fromLat);
        BigDecimal lat2Rad = toRadians(toLat);
        BigDecimal deltaLat = toRadians(toLat.subtract(fromLat));
        BigDecimal deltaLng = toRadians(toLng.subtract(fromLng));

        BigDecimal a = sin(deltaLat.divide(new BigDecimal("2"), 10, RoundingMode.HALF_UP))
                .pow(2)
                .add(cos(lat1Rad)
                        .multiply(cos(lat2Rad))
                        .multiply(sin(deltaLng.divide(new BigDecimal("2"), 10, RoundingMode.HALF_UP)).pow(2)));

        BigDecimal c = new BigDecimal("2")
                .multiply(atan2(sqrt(a), sqrt(new BigDecimal("1").subtract(a))));

        BigDecimal distance = EARTH_RADIUS_KM.multiply(c);
        return distance.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateRouteDistance(List<Waypoint> waypoints) {
        if (waypoints == null || waypoints.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDistance = BigDecimal.ZERO;
        for (int i = 0; i < waypoints.size() - 1; i++) {
            Waypoint from = waypoints.get(i);
            Waypoint to = waypoints.get(i + 1);
            BigDecimal segmentDistance = calculateDistance(from.lat(), from.lng(), to.lat(), to.lng());
            totalDistance = totalDistance.add(segmentDistance);
        }

        return totalDistance.setScale(2, RoundingMode.HALF_UP);
    }

    // Helper methods for trigonometric calculations
    private BigDecimal toRadians(BigDecimal degrees) {
        return degrees.multiply(new BigDecimal(Math.PI)).divide(new BigDecimal("180"), 10, RoundingMode.HALF_UP);
    }

    private BigDecimal sin(BigDecimal radians) {
        return new BigDecimal(Math.sin(radians.doubleValue()));
    }

    private BigDecimal cos(BigDecimal radians) {
        return new BigDecimal(Math.cos(radians.doubleValue()));
    }

    private BigDecimal sqrt(BigDecimal value) {
        return new BigDecimal(Math.sqrt(value.doubleValue()));
    }

    private BigDecimal atan2(BigDecimal y, BigDecimal x) {
        return new BigDecimal(Math.atan2(y.doubleValue(), x.doubleValue()));
    }
}
