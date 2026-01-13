package com.itwizard.swaedu.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Handles HTTP 401 (Unauthorized) responses when JWT authentication fails.
 * Returns simplified JSON error messages: "Need token for access", "Token is expired", or "Token is invalid".
 */
@Component
public class CustomBearerTokenAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        String message = resolveMessage(request, authException);
        writeResponse(response, message, HttpStatus.UNAUTHORIZED);
    }

    private String resolveMessage(HttpServletRequest request, AuthenticationException exception) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || authHeader.isBlank()) {
            return "Need token for access";
        }
        
        if (!authHeader.startsWith("Bearer ") || authHeader.length() <= 7 || authHeader.substring(7).trim().isEmpty()) {
            return "Need token for access";
        }

        if (isExpiredToken(exception)) {
            return "Token is expired";
        }

        return "Token is invalid";
    }

    private boolean isExpiredToken(AuthenticationException exception) {
        String message = exception.getMessage();
        if (message != null && message.toLowerCase().contains("expired")) {
            return true;
        }

        if (exception instanceof OAuth2AuthenticationException oauth2Ex) {
            OAuth2Error error = oauth2Ex.getError();
            if (error != null) {
                String description = error.getDescription();
                if (description != null && description.toLowerCase().contains("expired")) {
                    return true;
                }
            }
        }

        Throwable cause = exception.getCause();
        while (cause != null) {
            if (cause instanceof JwtException jwtException) {
                String jwtMessage = jwtException.getMessage();
                if (jwtMessage != null && jwtMessage.toLowerCase().contains("expired")) {
                    return true;
                }
            }
            cause = cause.getCause();
        }

        return false;
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

