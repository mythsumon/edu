package com.itwizard.swaedu.config.security;

import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Validates that the user in the JWT token exists in the database and is enabled.
 * Runs on every request with a JWT token to ensure disabled users cannot access protected resources.
 */
@Component
@RequiredArgsConstructor
public class UserEnabledValidator implements OAuth2TokenValidator<Jwt> {

    private final UserRepository userRepository;

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        String username = token.getSubject();
        if (username == null || username.isBlank()) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", null, null)
            );
        }

        return userRepository.findOptionalByUsername(username)
                .map(this::validateUserState)
                .orElseGet(() -> OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", null, null)
                ));
    }

    private OAuth2TokenValidatorResult validateUserState(User user) {
        if (Boolean.TRUE.equals(user.getEnabled())) {
            return OAuth2TokenValidatorResult.success();
        }

        return OAuth2TokenValidatorResult.failure(
                new OAuth2Error("invalid_token", null, null)
        );
    }
}

