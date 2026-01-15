package com.itwizard.swaedu.modules.auth.service;

import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.UnauthorizedException;
import com.itwizard.swaedu.modules.auth.dto.JwtPayload;
import com.itwizard.swaedu.modules.auth.entity.RefreshToken;
import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.auth.repository.RefreshTokenRepository;
import com.itwizard.swaedu.util.SecretGenerator;
import com.itwizard.swaedu.util.TokenGenerateParam;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenService {

    @Value("${auth.token.access-token-expiry:3600}")
    private long accessTokenExpiration;

    @Value("${auth.token.refresh-token-expiry:604800}")
    private long refreshTokenExpiration;

    private final SecretGenerator secretGenerator;
    private final JwtEncoder jwtEncoder;
    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenRepository refreshTokenRepository;

    private Long currentRefreshTokenId = null;

    public String generateAccessToken(JwtPayload jwtPayload) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("com.itwizard.swaedu")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(accessTokenExpiration))
                .subject(jwtPayload.getUsername())
                .claim("role", jwtPayload.getRole())
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String generateRefreshToken(User user, TokenGenerateParam param) throws Exception {
        Instant expirationTime = Instant.now().plusSeconds(refreshTokenExpiration);

        String token = this.secretGenerator.generateString(32);
        String lookup = this.secretGenerator.hmac(token);

        var refreshToken = refreshTokenRepository.save(RefreshToken
                .builder()
                .token(this.passwordEncoder.encode(token))
                .lookupHash(lookup)
                .createdByIp(param.getIp())
                .userAgent(param.getUserAgent())
                .user(user)
                .expiresAt(expirationTime)
                .build());

        currentRefreshTokenId = refreshToken.getId();

        return token;
    }

    public User revokeRefreshToken(String oldToken) throws Exception {
        String lookup = this.secretGenerator.hmac(oldToken);

        RefreshToken refreshToken = this.refreshTokenRepository.findByLookupHash(lookup)
                .orElseThrow(() -> new ResourceNotFoundException("TODO(i18n): token invalid or used"));

        try {
            if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
                throw new UnauthorizedException("TODO(i18n): Invalid refresh token");
            }

            if (refreshToken.isRevoked()) {
                throw new UnauthorizedException("TODO(i18n): Invalid refresh token");
            }

            if (currentRefreshTokenId != null) {
                refreshToken.setRevoked(true);
                refreshToken.setRevokedAt(Instant.now());
                refreshToken.setReplacedById(this.currentRefreshTokenId);

                this.refreshTokenRepository.save(refreshToken);
            }
        } catch (Exception ex) {
            // INFO: force delete refresh token
            // deleteRefreshToken(refreshToken);
        } finally {

            // INFO: force delete refresh token
            deleteRefreshToken(refreshToken);
        }

        return refreshToken.getUser();
    }

    private void deleteRefreshToken(RefreshToken token) {
        Optional<RefreshToken> dbToken = refreshTokenRepository.findById(token.getId());

        if (dbToken.isPresent()) {
            refreshTokenRepository.deleteById(token.getId());
        }
    }
}
