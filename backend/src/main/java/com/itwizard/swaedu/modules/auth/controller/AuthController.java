package com.itwizard.swaedu.modules.auth.controller;

import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.HttpUtil;
import com.itwizard.swaedu.modules.auth.dto.request.LoginRequestDto;
import com.itwizard.swaedu.modules.auth.dto.response.LoginResponseDto;
import com.itwizard.swaedu.modules.auth.dto.request.RegisterRequestDto;
import com.itwizard.swaedu.modules.auth.dto.request.RegisterAdminRequestDto;
import com.itwizard.swaedu.modules.auth.service.AuthService;
import com.itwizard.swaedu.util.ResponseUtil;
import com.itwizard.swaedu.util.TokenGenerateParam;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final HttpUtil httpUtil;

    private final AuthService authService;
    
    @Value("${auth.token.refresh-token-expiry:604800}")
    private long refreshTokenExpiration;

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

        // Set refresh token as HttpOnly cookie using ResponseCookie
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(refreshTokenExpiration)
                .sameSite("Lax")
                .build();

        // Build response with cookies in headers
        ApiResponse apiResponse = new ApiResponse(true, "Login successful", tokens);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(apiResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequestDto request) {
        authService.register(request);
        return ResponseUtil.created("User registered successfully", null);
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse> registerAdmin(@Valid @RequestBody RegisterAdminRequestDto request) {
        authService.registerAdmin(request);
        return ResponseUtil.created("Admin registered successfully", null);
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<ApiResponse> refreshToken(
            HttpServletRequest request,
            @RequestHeader(value = "User-Agent") String userAgent,
            @CookieValue(value = "refresh_token", required = false) String refreshToken) throws Exception {

        // Check if refresh_token exists in cookie
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseUtil.unauthorized("Refresh token not found in cookie");
        }

        String ip = this.httpUtil.getClientIp(request);

        // Refresh the access token using the refresh_token from cookie
        LoginResponseDto tokens = authService.refreshNewAccessToken(refreshToken,
                new TokenGenerateParam(ip, userAgent));

        // Set new refresh token as HttpOnly cookie
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(refreshTokenExpiration)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(new ApiResponse(true, "Token refreshed successfully", tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request) {
        // Clear refresh_token cookie by setting it with maxAge 0
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(new ApiResponse(true, "Logout successful", null));
    }
}
