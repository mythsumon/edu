package com.itwizard.swaedu.modules.auth.controller;

import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.modules.auth.service.UserService;
import com.itwizard.swaedu.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getLoggedInUser(Authentication authentication) {
        var user = userService.getUserByUsername(authentication.getName());
        return ResponseUtil.success("User profile retrieved successfully", user);
    }
}

