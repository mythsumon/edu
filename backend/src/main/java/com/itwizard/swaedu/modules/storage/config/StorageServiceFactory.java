package com.itwizard.swaedu.modules.storage.config;

import com.itwizard.swaedu.modules.storage.service.StorageService;
import com.itwizard.swaedu.modules.storage.service.impl.LocalStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Factory for creating the StorageService
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class StorageServiceFactory {
    
    private final LocalStorageService localStorageService;
    
    @Bean
    @Primary
    public StorageService storageService() {
        log.info("Initializing storage service with type: local");
        return localStorageService;
    }
}
