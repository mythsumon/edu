package com.itwizard.swaedu.modules.storage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration for serving static files from local storage
 * Maps /files/** to the uploads directory
 */
@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
    
    private final StorageProperties storageProperties;
    
    public FileStorageConfig(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configure resource handler for local storage
        String basePath = storageProperties.getLocal().getBasePath();
        
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:" + basePath + "/")
                .setCachePeriod(3600); // Cache for 1 hour
    }
}
