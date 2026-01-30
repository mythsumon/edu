package com.itwizard.swaedu.modules.travelallowance.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Kakao Maps API Configuration
 */
@Configuration
@ConfigurationProperties(prefix = "kakao.maps")
@Getter
@Setter
public class KakaoMapsConfig {
    /**
     * Kakao Maps REST API Key
     * Get from: https://developers.kakao.com/console/app
     */
    private String apiKey;

    /**
     * Base URL for Kakao Maps API
     */
    private String baseUrl = "https://dapi.kakao.com";

    /**
     * Static Map API endpoint
     */
    private String staticMapEndpoint = "/v2/maps/sdk/staticmap";

    /**
     * Default map width in pixels
     */
    private int defaultWidth = 800;

    /**
     * Default map height in pixels
     */
    private int defaultHeight = 600;

    /**
     * Default zoom level (1-14)
     */
    private int defaultZoom = 5;
}
