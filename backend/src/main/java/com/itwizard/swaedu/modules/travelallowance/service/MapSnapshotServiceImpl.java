package com.itwizard.swaedu.modules.travelallowance.service;

import com.edu.exception.BusinessException;
import com.edu.exception.ErrorCode;
import com.itwizard.swaedu.modules.storage.service.StorageService;
import com.itwizard.swaedu.modules.travelallowance.config.KakaoMapsConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Map Snapshot Service Implementation
 * 
 * Generates route map images using Kakao Maps Static Map API
 * and stores them via StorageService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MapSnapshotServiceImpl implements MapSnapshotService {

    private final KakaoMapsConfig kakaoMapsConfig;
    private final StorageService storageService;
    private final RestTemplate restTemplate;

    @Override
    public String generateRouteSnapshot(
            BigDecimal homeLat,
            BigDecimal homeLng,
            String homeAddress,
            List<Waypoint> waypoints,
            boolean returnHome
    ) {
        log.info("Generating route snapshot for home: {} ({}, {}), waypoints: {}", 
                homeAddress, homeLat, homeLng, waypoints.size());

        // Validate API key
        if (kakaoMapsConfig.getApiKey() == null || kakaoMapsConfig.getApiKey().trim().isEmpty()) {
            log.warn("Kakao Maps API key is not configured. Returning null.");
            return null;
        }

        try {
            // 1. Build all points for route (home + waypoints + return home if needed)
            List<Point> allPoints = new ArrayList<>();
            allPoints.add(new Point(homeLat, homeLng, "HOME", homeAddress));
            
            for (Waypoint waypoint : waypoints) {
                allPoints.add(new Point(waypoint.lat(), waypoint.lng(), waypoint.name(), waypoint.address()));
            }
            
            if (returnHome && !waypoints.isEmpty()) {
                allPoints.add(new Point(homeLat, homeLng, "HOME", homeAddress));
            }

            // 2. Calculate center and bounds for map view
            MapBounds bounds = calculateBounds(allPoints);
            Point center = bounds.getCenter();

            // 3. Build markers string (home + waypoints)
            String markers = buildMarkersString(allPoints);

            // 4. Build polyline string (route path)
            String polyline = buildPolylineString(allPoints);

            // 5. Build Static Map API URL
            String staticMapUrl = buildStaticMapUrl(center, bounds, markers, polyline);

            // 6. Download image from Kakao Maps API
            byte[] imageBytes = downloadMapImage(staticMapUrl);

            // 7. Save image to storage
            String imageUrl = saveImageToStorage(imageBytes, generateFileName(homeLat, homeLng, waypoints.size()));

            log.info("Successfully generated and saved map snapshot: {}", imageUrl);
            return imageUrl;

        } catch (Exception e) {
            log.error("Failed to generate map snapshot: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.MAP_SNAPSHOT_GENERATION_FAILED, 
                    "지도 이미지 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * Calculate map bounds from points
     */
    private MapBounds calculateBounds(List<Point> points) {
        if (points.isEmpty()) {
            throw new IllegalArgumentException("Points list cannot be empty");
        }

        BigDecimal minLat = points.get(0).lat;
        BigDecimal maxLat = points.get(0).lat;
        BigDecimal minLng = points.get(0).lng;
        BigDecimal maxLng = points.get(0).lng;

        for (Point point : points) {
            if (point.lat.compareTo(minLat) < 0) minLat = point.lat;
            if (point.lat.compareTo(maxLat) > 0) maxLat = point.lat;
            if (point.lng.compareTo(minLng) < 0) minLng = point.lng;
            if (point.lng.compareTo(maxLng) > 0) maxLng = point.lng;
        }

        BigDecimal centerLat = minLat.add(maxLat).divide(new BigDecimal("2"), 7, java.math.RoundingMode.HALF_UP);
        BigDecimal centerLng = minLng.add(maxLng).divide(new BigDecimal("2"), 7, java.math.RoundingMode.HALF_UP);

        return new MapBounds(
                new Point(centerLat, centerLng, "CENTER", null),
                minLat, maxLat, minLng, maxLng
        );
    }

    /**
     * Build markers string for Kakao Maps API
     * Format: lat,lng|lat,lng|...
     */
    private String buildMarkersString(List<Point> points) {
        return points.stream()
                .map(p -> p.lat + "," + p.lng)
                .collect(Collectors.joining("|"));
    }

    /**
     * Build polyline string for route path
     * Format: lat,lng lat,lng ...
     */
    private String buildPolylineString(List<Point> points) {
        return points.stream()
                .map(p -> p.lat + "," + p.lng)
                .collect(Collectors.joining(" "));
    }

    /**
     * Build Static Map API URL
     * Kakao Maps Static Map API format:
     * center=lng,lat&level=zoom&width=w&height=h&markers=lat,lng|lat,lng&path=lat,lng lat,lng
     */
    private String buildStaticMapUrl(Point center, MapBounds bounds, String markers, String polyline) {
        StringBuilder url = new StringBuilder();
        url.append(kakaoMapsConfig.getBaseUrl());
        url.append(kakaoMapsConfig.getStaticMapEndpoint());
        url.append("?");
        
        // Center point (Kakao Maps uses lng,lat format)
        url.append("center=").append(center.lng).append(",").append(center.lat);
        
        // Map size
        url.append("&width=").append(kakaoMapsConfig.getDefaultWidth());
        url.append("&height=").append(kakaoMapsConfig.getDefaultHeight());
        
        // Zoom level (calculate based on bounds)
        int zoom = calculateZoom(bounds);
        url.append("&level=").append(zoom);
        
        // Markers (format: lat,lng|lat,lng|...)
        if (markers != null && !markers.isEmpty()) {
            url.append("&markers=").append(URLEncoder.encode(markers, StandardCharsets.UTF_8));
        }
        
        // Path (route polyline) - format: lat,lng lat,lng ...
        // Note: Kakao Maps Static Map API path format uses space-separated lat,lng pairs
        if (polyline != null && !polyline.isEmpty()) {
            url.append("&path=").append(URLEncoder.encode(polyline, StandardCharsets.UTF_8));
        }

        return url.toString();
    }

    /**
     * Calculate appropriate zoom level based on bounds
     */
    private int calculateZoom(MapBounds bounds) {
        BigDecimal latDiff = bounds.maxLat.subtract(bounds.minLat);
        BigDecimal lngDiff = bounds.maxLng.subtract(bounds.minLng);
        BigDecimal maxDiff = latDiff.compareTo(lngDiff) > 0 ? latDiff : lngDiff;

        // Simple zoom calculation (can be improved)
        if (maxDiff.compareTo(new BigDecimal("0.5")) > 0) return 5;
        if (maxDiff.compareTo(new BigDecimal("0.2")) > 0) return 6;
        if (maxDiff.compareTo(new BigDecimal("0.1")) > 0) return 7;
        if (maxDiff.compareTo(new BigDecimal("0.05")) > 0) return 8;
        if (maxDiff.compareTo(new BigDecimal("0.02")) > 0) return 9;
        if (maxDiff.compareTo(new BigDecimal("0.01")) > 0) return 10;
        return 11;
    }

    /**
     * Download map image from Kakao Maps API
     */
    private byte[] downloadMapImage(String url) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoMapsConfig.getApiKey());
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    byte[].class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new IOException("Failed to download map image. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error downloading map image from Kakao Maps API: {}", e.getMessage(), e);
            throw new IOException("Failed to download map image: " + e.getMessage(), e);
        }
    }

    /**
     * Save image to storage service
     */
    private String saveImageToStorage(byte[] imageBytes, String fileName) throws IOException {
        // Create MultipartFile from byte array
        MultipartFile multipartFile = new ByteArrayMultipartFile(
                imageBytes,
                fileName,
                "image/png"
        );

        // Upload to storage
        return storageService.uploadFile(multipartFile, "map-snapshots");
    }

    /**
     * Generate file name for map snapshot
     */
    private String generateFileName(BigDecimal homeLat, BigDecimal homeLng, int waypointCount) {
        long timestamp = System.currentTimeMillis();
        return String.format("route_%s_%s_%d_%d.png", 
                homeLat.toPlainString().replace(".", "_"),
                homeLng.toPlainString().replace(".", "_"),
                waypointCount,
                timestamp);
    }

    // ========== Helper Classes ==========

    private static class Point {
        final BigDecimal lat;
        final BigDecimal lng;
        final String name;
        final String address;

        Point(BigDecimal lat, BigDecimal lng, String name, String address) {
            this.lat = lat;
            this.lng = lng;
            this.name = name;
            this.address = address;
        }
    }

    private static class MapBounds {
        final Point center;
        final BigDecimal minLat;
        final BigDecimal maxLat;
        final BigDecimal minLng;
        final BigDecimal maxLng;

        MapBounds(Point center, BigDecimal minLat, BigDecimal maxLat, BigDecimal minLng, BigDecimal maxLng) {
            this.center = center;
            this.minLat = minLat;
            this.maxLat = maxLat;
            this.minLng = minLng;
            this.maxLng = maxLng;
        }

        Point getCenter() {
            return center;
        }
    }

    /**
     * MultipartFile implementation from byte array
     */
    private static class ByteArrayMultipartFile implements MultipartFile {
        private final byte[] content;
        private final String name;
        private final String contentType;

        ByteArrayMultipartFile(byte[] content, String name, String contentType) {
            this.content = content;
            this.name = name;
            this.contentType = contentType;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return name;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content == null || content.length == 0;
        }

        @Override
        public long getSize() {
            return content != null ? content.length : 0;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
            java.nio.file.Files.write(dest.toPath(), content);
        }
    }
}
