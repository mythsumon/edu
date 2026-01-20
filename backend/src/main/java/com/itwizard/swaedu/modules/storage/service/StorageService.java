package com.itwizard.swaedu.modules.storage.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Storage service interface for pluggable file storage strategies.
 * Implementations can be switched (local, S3, Azure, etc.) without changing controllers.
 */
public interface StorageService {
    
    /**
     * Upload a file and return the publicly accessible URL
     * 
     * @param file The file to upload
     * @param subdirectory Optional subdirectory path (e.g., "profiles", "documents")
     * @return Publicly accessible URL to the uploaded file
     * @throws IOException if file operations fail
     */
    String uploadFile(MultipartFile file, String subdirectory) throws IOException;
    
    /**
     * Delete a file by its URL
     * 
     * @param fileUrl The URL of the file to delete
     * @return true if deletion was successful, false otherwise
     * @throws IOException if file operations fail
     */
    boolean deleteFile(String fileUrl) throws IOException;
    
    /**
     * Check if a file exists at the given URL
     * 
     * @param fileUrl The URL to check
     * @return true if file exists, false otherwise
     */
    boolean fileExists(String fileUrl);
    
    /**
     * Get the storage type name (e.g., "local", "s3", "azure")
     * 
     * @return Storage type identifier
     */
    String getStorageType();
}
