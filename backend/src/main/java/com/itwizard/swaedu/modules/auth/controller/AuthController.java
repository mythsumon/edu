package com.itwizard.swaedu.modules.auth.controller;

import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.HttpUtil;
import com.itwizard.swaedu.modules.auth.dto.request.LoginRequestDto;
import com.itwizard.swaedu.modules.auth.dto.response.LoginResponseDto;
import com.itwizard.swaedu.modules.auth.dto.request.RefreshTokenRequestDto;
import com.itwizard.swaedu.modules.auth.dto.request.RegisterRequestDto;
import com.itwizard.swaedu.modules.auth.service.AuthService;
import com.itwizard.swaedu.util.ResponseUtil;
import com.itwizard.swaedu.util.TokenGenerateParam;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final HttpUtil httpUtil;

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse> getUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseUtil.success("Welcome", "anonymous user");
        }
        return ResponseUtil.success("Welcome", authentication.getName());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            HttpServletRequest request,
            @RequestHeader(value = "User-Agent") String userAgent,
            @Valid @RequestBody LoginRequestDto loginRequest) throws Exception {

        String ip = this.httpUtil.getClientIp(request);

        LoginResponseDto tokens = authService.login(loginRequest, new TokenGenerateParam(ip, userAgent));
        return ResponseUtil.success("Login successful", tokens);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequestDto request) {
        authService.register(request);
        return ResponseUtil.created("User registered successfully", null);
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<ApiResponse> register(
            HttpServletRequest request,
            @RequestHeader(value = "User-Agent") String userAgent,
            @Valid @RequestBody RefreshTokenRequestDto requestDto) throws Exception {

        String ip = this.httpUtil.getClientIp(request);

        LoginResponseDto tokens = authService.refreshNewAccessToken(requestDto.getToken(),
                new TokenGenerateParam(ip, userAgent));

        return ResponseUtil.created("TODO(i18n): refresh new access-token", tokens);
    }
}
