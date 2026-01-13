package com.itwizard.swaedu.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Handles HTTP 403 (Forbidden) responses when authenticated users lack required permissions.
 * Returns JSON response in ApiResponse format: {"success":false,"message":"Access denied","data":null}
 */
@Component
public class CustomBearerTokenAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        String message = accessDeniedException.getMessage();
        if (message == null || message.isBlank()) {
            message = "Access denied";
        }

        writeResponse(response, message, HttpStatus.FORBIDDEN);
    }

    private void writeResponse(HttpServletResponse response, String message, HttpStatus status) throws IOException {
        if (!response.isCommitted()) {
            response.setStatus(status.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            
            String jsonResponse = buildBody(message);
            response.getWriter().write(jsonResponse);
            response.getWriter().flush();
        }
    }

    private String buildBody(String message) {
        String safeMessage = escapeJson(message);
        return "{\"success\":false,\"message\":\"" + safeMessage + "\",\"data\":null}";
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}

