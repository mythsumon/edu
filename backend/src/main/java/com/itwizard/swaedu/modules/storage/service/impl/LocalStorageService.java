package com.itwizard.swaedu.modules.storage.service.impl;

import com.itwizard.swaedu.modules.storage.config.StorageProperties;
import com.itwizard.swaedu.modules.storage.service.StorageService;
import com.itwizard.swaedu.modules.storage.util.FileValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Local file system storage implementation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {
    
    private final StorageProperties storageProperties;
    
    @Override
    public String uploadFile(MultipartFile file, String subdirectory) throws IOException {
        StorageProperties.Local localConfig = storageProperties.getLocal();
        
        // Validate file
        FileValidationUtil.validateImageFile(
            file, 
            localConfig.getAllowedImageTypes(), 
            localConfig.getMaxFileSize()
        );
        
        // Generate unique filename
        String uniqueFilename = FileValidationUtil.generateUniqueFilename(
            file.getOriginalFilename()
        );
        
        // Build file path
        String relativePath = FileValidationUtil.buildFilePath(subdirectory, uniqueFilename);
        
        // Create base directory if it doesn't exist
        Path baseDir = Paths.get(localConfig.getBasePath());
        if (!Files.exists(baseDir)) {
            Files.createDirectories(baseDir);
            log.info("Created base directory: {}", baseDir.toAbsolutePath());
        }
        
        // Create subdirectory if specified
        if (subdirectory != null && !subdirectory.trim().isEmpty()) {
            Path subdirPath = baseDir.resolve(subdirectory.trim());
            if (!Files.exists(subdirPath)) {
                Files.createDirectories(subdirPath);
                log.info("Created subdirectory: {}", subdirPath.toAbsolutePath());
            }
        }
        
        // Save file
        Path targetPath = baseDir.resolve(relativePath);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        log.info("File uploaded successfully: {}", targetPath.toAbsolutePath());
        
        // Return publicly accessible URL
        String baseUrl = localConfig.getBaseUrl().replaceAll("/$", ""); // Remove trailing slash
        String urlPath = relativePath.replace("\\", "/"); // Normalize path separators
        return baseUrl + "/" + urlPath;
    }
    
    @Override
    public boolean deleteFile(String fileUrl) {
        try {
            StorageProperties.Local localConfig = storageProperties.getLocal();
            String baseUrl = localConfig.getBaseUrl().replaceAll("/$", "");
            
            // Extract relative path from URL
            if (!fileUrl.startsWith(baseUrl)) {
                log.warn("File URL does not match base URL: {}", fileUrl);
                return false;
            }
            
            String relativePath = fileUrl.substring(baseUrl.length()).replaceAll("^/+", "");
            Path filePath = Paths.get(localConfig.getBasePath(), relativePath);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", filePath.toAbsolutePath());
                return true;
            } else {
                log.warn("File not found for deletion: {}", filePath.toAbsolutePath());
                return false;
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", fileUrl, e);
            return false;
        }
    }
    
    @Override
    public boolean fileExists(String fileUrl) {
        try {
            StorageProperties.Local localConfig = storageProperties.getLocal();
            String baseUrl = localConfig.getBaseUrl().replaceAll("/$", "");
            
            if (!fileUrl.startsWith(baseUrl)) {
                return false;
            }
            
            String relativePath = fileUrl.substring(baseUrl.length()).replaceAll("^/+", "");
            Path filePath = Paths.get(localConfig.getBasePath(), relativePath);
            
            return Files.exists(filePath) && Files.isRegularFile(filePath);
        } catch (Exception e) {
            log.error("Error checking file existence: {}", fileUrl, e);
            return false;
        }
    }
    
    @Override
    public String getStorageType() {
        return "local";
    }
}
