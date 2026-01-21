package com.itwizard.swaedu.modules.storage.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for file storage
 * Loaded from application.properties
 */
@Data
@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {
    
    /**
     * Local storage configuration
     */
    private Local local = new Local();
    
    @Data
    public static class Local {
        /**
         * Base directory for storing files
         */
        private String basePath = "uploads";
        
        /**
         * Base URL for accessing files (e.g., "http://localhost:8080/files")
         */
        private String baseUrl = "http://localhost:8080/files";
        
        /**
         * Maximum file size in bytes (default: 10MB)
         */
        private long maxFileSize = 10 * 1024 * 1024;
        
        /**
         * Allowed image content types
         */
        private String[] allowedImageTypes = {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
        };
    }
}
