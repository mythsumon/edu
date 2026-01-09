package com.itwizard.swaedu.modules.auth.mapper;

import com.itwizard.swaedu.modules.auth.dto.JwtPayload;
import com.itwizard.swaedu.modules.auth.entity.User;

/**
 * Mapper utility class for converting between User entity and DTOs
 */
public class AuthMapper {

    private AuthMapper() {
        // Utility class - prevent instantiation
    }

    /**
     * Convert User entity to JwtPayload
     */
    public static JwtPayload toJwtPayload(User user) {
        if (user == null) {
            return null;
        }
        return JwtPayload.builder()
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}

