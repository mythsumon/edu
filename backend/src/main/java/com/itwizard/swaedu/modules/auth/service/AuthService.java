package com.itwizard.swaedu.modules.auth.service;

import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.UnauthorizedException;
import com.itwizard.swaedu.modules.auth.dto.request.LoginRequestDto;
import com.itwizard.swaedu.modules.auth.dto.response.LoginResponseDto;
import com.itwizard.swaedu.modules.auth.repository.UserRepository;
import com.itwizard.swaedu.modules.auth.mapper.AuthMapper;
import com.itwizard.swaedu.util.TokenGenerateParam;
import com.itwizard.swaedu.modules.auth.dto.JwtPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDto login(LoginRequestDto request, TokenGenerateParam param) throws Exception {
        User user = userRepository.findByUsername(request.getUsername());

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Incorrect password");
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new UnauthorizedException("User account is disabled");
        }

        JwtPayload jwtPayload = AuthMapper.toJwtPayload(user);

        String accessToken = tokenService.generateAccessToken(jwtPayload);
        String refreshToken = tokenService.generateRefreshToken(user, param);

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public LoginResponseDto refreshNewAccessToken(
            String oldToken, TokenGenerateParam param) throws Exception {

        User user = this.tokenService.revokeRefreshToken(oldToken);

        JwtPayload jwtPayload = AuthMapper.toJwtPayload(user);

        String accessToken = tokenService.generateAccessToken(jwtPayload);
        String refreshToken = tokenService.generateRefreshToken(user, param);

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
