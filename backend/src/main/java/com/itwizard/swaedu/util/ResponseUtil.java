package com.itwizard.swaedu.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Utility class for building API responses in a clean, fluent way
 */
public class ResponseUtil {

    /**
     * Build a successful response with message and data
     */
    public static ResponseEntity<ApiResponse> success(String message, Object data) {
        return ResponseEntity.ok(new ApiResponse(true, message, data));
    }

    /**
     * Build a successful response with only message (no data)
     */
    public static ResponseEntity<ApiResponse> success(String message) {
        return ResponseEntity.ok(new ApiResponse(true, message, null));
    }

    /**
     * Build an error response with message
     */
    public static ResponseEntity<ApiResponse> error(String message) {
        return ResponseEntity.badRequest().body(new ApiResponse(false, message, null));
    }

    /**
     * Build an error response with custom status code
     */
    public static ResponseEntity<ApiResponse> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiResponse(false, message, null));
    }

    /**
     * Build a not found response
     */
    public static ResponseEntity<ApiResponse> notFound(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, message, null));
    }

    /**
     * Build an unauthorized response
     */
    public static ResponseEntity<ApiResponse> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, message, null));
    }

    /**
     * Build a created response (201)
     */
    public static ResponseEntity<ApiResponse> created(String message, Object data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, message, data));
    }

    /**
     * Build a no content response (204)
     */
    public static ResponseEntity<ApiResponse> noContent(String message) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(new ApiResponse(true, message, null));
    }
}
