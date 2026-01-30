package com.itwizard.swaedu.modules.travelallowance.service;

import com.edu.exception.BusinessException;
import com.edu.exception.ErrorCode;
import com.itwizard.swaedu.modules.training.entity.TrainingEntity;
import com.itwizard.swaedu.modules.instructor.entity.Instructor;
import com.itwizard.swaedu.modules.instructor.repository.InstructorRepository;
import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.institutions.repository.InstitutionRepository;
import com.itwizard.swaedu.modules.period.entity.PeriodEntity;
import com.itwizard.swaedu.modules.period.repository.PeriodRepository;
import com.itwizard.swaedu.modules.travelallowance.dto.response.DailyTravelResponseDto;
import com.itwizard.swaedu.modules.travelallowance.dto.response.MonthlyTravelSummaryDto;
import com.itwizard.swaedu.modules.travelallowance.dto.response.WaypointResponseDto;
import com.itwizard.swaedu.modules.travelallowance.entity.InstructorDailyTravel;
import com.itwizard.swaedu.modules.travelallowance.entity.TravelAllowancePolicy;
import com.itwizard.swaedu.modules.travelallowance.entity.TravelWaypoint;
import com.itwizard.swaedu.modules.travelallowance.repository.InstructorDailyTravelRepository;
import com.itwizard.swaedu.modules.travelallowance.repository.TravelAllowancePolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Travel Allowance Service Implementation
 * 
 * NOTE: This implementation assumes that instructor assignments to periods exist.
 * If there's no assignment table yet, you'll need to:
 * 1. Create an assignment table (instructor_period_assignment) linking instructors to periods
 * 2. Update the queryInstructorPeriods method to use that table
 * 
 * For now, this is a placeholder that will need the assignment table to be created.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TravelAllowanceServiceImpl implements TravelAllowanceService {

    private final InstructorRepository instructorRepository;
    private final InstitutionRepository institutionRepository;
    private final PeriodRepository periodRepository;
    private final InstructorDailyTravelRepository dailyTravelRepository;
    private final TravelAllowancePolicyRepository policyRepository;
    private final DistanceCalculationService distanceService;
    private final MapSnapshotService mapSnapshotService;

    private static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");

    @Override
    @Transactional
    public DailyTravelResponseDto recalculateDailyTravel(Long instructorId, LocalDate date) {
        log.info("Recalculating daily travel for instructor {} on date {}", instructorId, date);

        // 1. Get instructor
        Instructor instructor = instructorRepository.findByUserId(instructorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INSTRUCTOR_NOT_FOUND));

        // 2. Validate instructor has home address
        if (instructor.getHomeAddress() == null || instructor.getHomeAddress().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.INSTRUCTOR_ADDRESS_MISSING);
        }
        if (instructor.getHomeLat() == null || instructor.getHomeLng() == null) {
            throw new BusinessException(ErrorCode.INSTRUCTOR_ADDRESS_MISSING, 
                    "강사의 집 주소 좌표가 등록되지 않았습니다.");
        }

        // 3. Find all periods for this instructor on this date
        List<PeriodEntity> periods = queryInstructorPeriods(instructorId, date);
        
        if (periods.isEmpty()) {
            // No periods = no travel, but we still create a record with 0 distance
            return createEmptyDailyTravel(instructor, date);
        }

        // 4. Build route: Home → Inst1 → Inst2 → ... → Home
        List<RoutePoint> routePoints = buildRoute(instructor, periods);

        // 5. Calculate total distance
        BigDecimal totalDistance = calculateRouteDistance(routePoints);

        // 6. Apply policy to get travel fee amount
        Integer travelFeeAmount = applyPolicy(totalDistance, date);

        // 7. Generate map snapshot
        String mapSnapshotUrl = null;
        InstructorDailyTravel.TravelStatus status = InstructorDailyTravel.TravelStatus.DRAFT;
        
        try {
            List<MapSnapshotService.Waypoint> waypoints = routePoints.stream()
                    .skip(1) // Skip home (first point)
                    .filter(p -> !p.isHome()) // Only institutions
                    .map(p -> new MapSnapshotService.Waypoint(
                            p.getLat(), p.getLng(), p.getAddress(), p.getName()))
                    .collect(Collectors.toList());

            mapSnapshotUrl = mapSnapshotService.generateRouteSnapshot(
                    instructor.getHomeLat(),
                    instructor.getHomeLng(),
                    instructor.getHomeAddress(),
                    waypoints,
                    true // returnHome = true
            );

            if (mapSnapshotUrl != null && !mapSnapshotUrl.trim().isEmpty()) {
                status = InstructorDailyTravel.TravelStatus.FINAL;
            }
        } catch (Exception e) {
            log.warn("Failed to generate map snapshot for instructor {} on date {}: {}", 
                    instructorId, date, e.getMessage());
            // Continue with DRAFT status
        }

        // 8. Save or update daily travel record
        InstructorDailyTravel dailyTravel = dailyTravelRepository
                .findByInstructorIdAndTravelDate(instructorId, date)
                .orElse(null);

        if (dailyTravel == null) {
            dailyTravel = InstructorDailyTravel.builder()
                    .instructor(instructor)
                    .instructorId(instructorId)
                    .travelDate(date)
                    .workMonth(date.toString().substring(0, 7)) // YYYY-MM
                    .totalDistanceKm(totalDistance)
                    .travelFeeAmountKrw(travelFeeAmount)
                    .mapSnapshotUrl(mapSnapshotUrl)
                    .status(status)
                    .waypoints(new ArrayList<>())
                    .build();
        } else {
            dailyTravel.setTotalDistanceKm(totalDistance);
            dailyTravel.setTravelFeeAmountKrw(travelFeeAmount);
            dailyTravel.setMapSnapshotUrl(mapSnapshotUrl);
            dailyTravel.setStatus(status);
            dailyTravel.getWaypoints().clear();
        }

        // 9. Create waypoints
        int seq = 0;
        for (RoutePoint point : routePoints) {
            TravelWaypoint waypoint = TravelWaypoint.builder()
                    .dailyTravel(dailyTravel)
                    .seq(seq++)
                    .institution(point.getInstitution())
                    .institutionId(point.getInstitutionId())
                    .institutionName(point.getName())
                    .institutionAddress(point.getAddress())
                    .lat(point.getLat())
                    .lng(point.getLng())
                    .training(point.getTraining())
                    .trainingId(point.getTrainingId())
                    .build();
            dailyTravel.getWaypoints().add(waypoint);
        }

        InstructorDailyTravel saved = dailyTravelRepository.save(dailyTravel);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyTravelResponseDto> getDailyTravelRecords(Long instructorId, LocalDate from, LocalDate to) {
        List<InstructorDailyTravel> records = dailyTravelRepository
                .findByInstructorIdAndTravelDateBetween(instructorId, from, to);
        return records.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlyTravelSummaryDto getMonthlyTravelSummary(Long instructorId, String month) {
        List<InstructorDailyTravel> records = dailyTravelRepository
                .findByInstructorIdAndWorkMonth(instructorId, month);
        
        Integer totalAmount = dailyTravelRepository.calculateMonthlyTotal(instructorId, month);

        return MonthlyTravelSummaryDto.builder()
                .instructorId(instructorId)
                .month(month)
                .dailyRecords(records.stream().map(this::toDto).collect(Collectors.toList()))
                .totalTravelExpense(totalAmount != null ? totalAmount : 0)
                .build();
    }

    @Override
    @Transactional
    public void rebuildDailyTravelRecords(Long instructorId, LocalDate fromDate, LocalDate toDate) {
        if (instructorId != null) {
            // Rebuild for specific instructor
            rebuildForInstructor(instructorId, fromDate, toDate);
        } else {
            // Rebuild for all instructors (expensive operation)
            log.warn("Rebuilding daily travel records for ALL instructors - this may take a while");
            // TODO: Implement batch processing for all instructors
        }
    }

    // ========== Private Helper Methods ==========

    /**
     * Query periods for an instructor on a specific date
     * 
     * TODO: This method needs to be updated when instructor-period assignment table is created.
     * For now, this is a placeholder that assumes we can query periods by date and instructor.
     * 
     * Current assumption: We need to create an assignment table or modify PeriodEntity to include instructor_id.
     * Alternative: Query all periods on the date and filter by some assignment logic.
     */
    private List<PeriodEntity> queryInstructorPeriods(Long instructorId, LocalDate date) {
        // TODO: Implement actual query when assignment table exists
        // For now, return empty list - this will need to be implemented based on your assignment model
        log.warn("queryInstructorPeriods is not yet implemented - needs assignment table");
        return new ArrayList<>();
        
        // Example implementation (when assignment table exists):
        // return periodRepository.findByInstructorIdAndDate(instructorId, date);
    }

    /**
     * Build route: Home → Inst1 → Inst2 → ... → Home
     * Orders institutions by training start time
     */
    private List<RoutePoint> buildRoute(Instructor instructor, List<PeriodEntity> periods) {
        List<RoutePoint> route = new ArrayList<>();

        // Start with home
        route.add(RoutePoint.home(
                instructor.getHomeLat(),
                instructor.getHomeLng(),
                instructor.getHomeAddress()
        ));

        // Sort periods by start time
        List<PeriodEntity> sortedPeriods = periods.stream()
                .sorted(Comparator.comparing(PeriodEntity::getStartTime))
                .collect(Collectors.toList());

        // Add institutions in order
        for (PeriodEntity period : sortedPeriods) {
            InstitutionEntity institution = period.getTraining().getInstitution();
            
            if (institution.getInstitutionLat() == null || institution.getInstitutionLng() == null) {
                log.warn("Institution {} has no coordinates, skipping", institution.getId());
                continue;
            }

            route.add(RoutePoint.institution(
                    institution.getInstitutionLat(),
                    institution.getInstitutionLng(),
                    institution.getAddress() != null ? institution.getAddress() : institution.getStreet(),
                    institution.getName(),
                    institution,
                    period.getTraining()
            ));
        }

        // End with home (return)
        route.add(RoutePoint.home(
                instructor.getHomeLat(),
                instructor.getHomeLng(),
                instructor.getHomeAddress()
        ));

        return route;
    }

    /**
     * Calculate total distance for route
     */
    private BigDecimal calculateRouteDistance(List<RoutePoint> routePoints) {
        if (routePoints.size() < 2) {
            return BigDecimal.ZERO;
        }

        List<DistanceCalculationService.Waypoint> waypoints = routePoints.stream()
                .map(p -> new DistanceCalculationService.Waypoint(p.getLat(), p.getLng()))
                .collect(Collectors.toList());

        return distanceService.calculateRouteDistance(waypoints);
    }

    /**
     * Apply policy to get travel fee amount
     */
    private Integer applyPolicy(BigDecimal distanceKm, LocalDate date) {
        TravelAllowancePolicy policy = policyRepository.findMatchingPolicy(distanceKm, date)
                .orElseThrow(() -> new BusinessException(ErrorCode.TRAVEL_POLICY_NOT_FOUND,
                        "거리 " + distanceKm + "km에 해당하는 여비 정책을 찾을 수 없습니다."));

        return policy.getAmountKrw();
    }

    /**
     * Create empty daily travel record (no periods on this date)
     */
    private DailyTravelResponseDto createEmptyDailyTravel(Instructor instructor, LocalDate date) {
        InstructorDailyTravel dailyTravel = InstructorDailyTravel.builder()
                .instructor(instructor)
                .instructorId(instructor.getUserId())
                .travelDate(date)
                .workMonth(date.toString().substring(0, 7))
                .totalDistanceKm(BigDecimal.ZERO)
                .travelFeeAmountKrw(0)
                .mapSnapshotUrl(null)
                .status(InstructorDailyTravel.TravelStatus.DRAFT)
                .waypoints(new ArrayList<>())
                .build();

        InstructorDailyTravel saved = dailyTravelRepository.save(dailyTravel);
        return toDto(saved);
    }

    /**
     * Convert entity to DTO
     */
    private DailyTravelResponseDto toDto(InstructorDailyTravel entity) {
        return DailyTravelResponseDto.builder()
                .id(entity.getId())
                .instructorId(entity.getInstructorId())
                .instructorName(entity.getInstructor().getName())
                .travelDate(entity.getTravelDate())
                .workMonth(entity.getWorkMonth())
                .totalDistanceKm(entity.getTotalDistanceKm())
                .travelFeeAmountKrw(entity.getTravelFeeAmountKrw())
                .mapSnapshotUrl(entity.getMapSnapshotUrl())
                .status(entity.getStatus().name())
                .waypoints(entity.getWaypoints().stream()
                        .map(this::waypointToDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private WaypointResponseDto waypointToDto(TravelWaypoint waypoint) {
        return WaypointResponseDto.builder()
                .seq(waypoint.getSeq())
                .institutionId(waypoint.getInstitutionId())
                .institutionName(waypoint.getInstitutionName())
                .institutionAddress(waypoint.getInstitutionAddress())
                .lat(waypoint.getLat())
                .lng(waypoint.getLng())
                .trainingId(waypoint.getTrainingId())
                .isHome(waypoint.isHome())
                .build();
    }

    private void rebuildForInstructor(Long instructorId, LocalDate fromDate, LocalDate toDate) {
        // TODO: Implement batch recalculation for date range
        log.info("Rebuilding daily travel for instructor {} from {} to {}", instructorId, fromDate, toDate);
    }

    /**
     * Internal route point data structure
     */
    private static class RoutePoint {
        private final BigDecimal lat;
        private final BigDecimal lng;
        private final String address;
        private final String name;
        private final InstitutionEntity institution;
        private final Long institutionId;
        private final com.itwizard.swaedu.modules.training.entity.TrainingEntity training;
        private final Long trainingId;
        private final boolean isHome;

        private RoutePoint(BigDecimal lat, BigDecimal lng, String address, String name,
                          InstitutionEntity institution, Long institutionId,
                          com.itwizard.swaedu.modules.training.entity.TrainingEntity training, Long trainingId,
                          boolean isHome) {
            this.lat = lat;
            this.lng = lng;
            this.address = address;
            this.name = name;
            this.institution = institution;
            this.institutionId = institutionId;
            this.training = training;
            this.trainingId = trainingId;
            this.isHome = isHome;
        }

        static RoutePoint home(BigDecimal lat, BigDecimal lng, String address) {
            return new RoutePoint(lat, lng, address, "HOME", null, null, null, null, true);
        }

        static RoutePoint institution(BigDecimal lat, BigDecimal lng, String address, String name,
                                     InstitutionEntity institution,
                                     com.itwizard.swaedu.modules.training.entity.TrainingEntity training) {
            return new RoutePoint(lat, lng, address, name, institution, institution.getId(),
                    training, training.getId(), false);
        }

        // Getters
        public BigDecimal getLat() { return lat; }
        public BigDecimal getLng() { return lng; }
        public String getAddress() { return address; }
        public String getName() { return name; }
        public InstitutionEntity getInstitution() { return institution; }
        public Long getInstitutionId() { return institutionId; }
        public com.itwizard.swaedu.modules.training.entity.TrainingEntity getTraining() { return training; }
        public Long getTrainingId() { return trainingId; }
        public boolean isHome() { return isHome; }
    }
}
