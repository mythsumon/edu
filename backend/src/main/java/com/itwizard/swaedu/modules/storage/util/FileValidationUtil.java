package com.itwizard.swaedu.modules.storage.util;

import com.itwizard.swaedu.exception.ValidationException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Utility class for file validation and name generation
 */
public class FileValidationUtil {
    
    private FileValidationUtil() {
        // Utility class - prevent instantiation
    }
    
    /**
     * Validate image file
     * 
     * @param file The file to validate
     * @param allowedTypes List of allowed MIME types
     * @param maxSize Maximum file size in bytes
     * @throws ValidationException if validation fails
     */
    public static void validateImageFile(MultipartFile file, String[] allowedTypes, long maxSize) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("File is required and cannot be empty");
        }
        
        // Check file size
        if (file.getSize() > maxSize) {
            long maxSizeMB = maxSize / (1024 * 1024);
            throw new ValidationException(
                String.format("File size exceeds maximum allowed size of %d MB", maxSizeMB)
            );
        }
        
        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedContentType(contentType, allowedTypes)) {
            throw new ValidationException(
                String.format("Invalid file type. Allowed types: %s", Arrays.toString(allowedTypes))
            );
        }
        
        // Check if file has a name
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new ValidationException("File must have a valid filename");
        }
    }
    
    /**
     * Check if content type is in the allowed list
     */
    private static boolean isAllowedContentType(String contentType, String[] allowedTypes) {
        List<String> allowedList = Arrays.asList(allowedTypes);
        return allowedList.contains(contentType.toLowerCase());
    }
    
    /**
     * Generate a unique filename while preserving the original extension
     * Format: {UUID}_{timestamp}.{extension}
     * 
     * @param originalFilename Original filename
     * @return Unique filename
     */
    public static String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String uuid = UUID.randomUUID().toString().replace("-", "");
        long timestamp = System.currentTimeMillis();
        return String.format("%s_%d%s", uuid, timestamp, extension);
    }
    
    /**
     * Extract file extension from filename
     * 
     * @param filename Original filename
     * @return Extension with dot (e.g., ".jpg") or empty string if no extension
     */
    public static String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex).toLowerCase();
    }
    
    /**
     * Build file path with subdirectory
     * 
     * @param subdirectory Optional subdirectory (e.g., "profiles", "documents")
     * @param filename The filename
     * @return Full file path
     */
    public static String buildFilePath(String subdirectory, String filename) {
        if (subdirectory == null || subdirectory.trim().isEmpty()) {
            return filename;
        }
        // Normalize subdirectory (remove leading/trailing slashes)
        String normalizedSubdir = subdirectory.trim().replaceAll("^/+|/+$", "");
        return normalizedSubdir + "/" + filename;
    }
}
