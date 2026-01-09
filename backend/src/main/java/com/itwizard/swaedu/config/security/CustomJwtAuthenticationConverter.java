package com.itwizard.swaedu.config.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Extracts the "role" claim from JWT tokens and converts them to Spring Security authorities.
 * Automatically prefixes roles with "ROLE_" if not already present (required for hasRole() checks).
 * Handles both single role strings and role collections.
 */
@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        Object roleClaim = jwt.getClaim("role");
        if (roleClaim == null) {
            return List.of();
        }

        List<String> roles = new ArrayList<>();

        if (roleClaim instanceof String roleString) {
            roles.add(roleString);
        } else if (roleClaim instanceof Collection<?> collection) {
            roles.addAll(collection.stream()
                    .map(Object::toString)
                    .collect(Collectors.toList()));
        }

        return roles.stream()
                .filter(r -> r != null && !r.isBlank())
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }
}

