package com.itwizard.swaedu.modules.auth.service;

import com.itwizard.swaedu.modules.auth.dto.request.ChangePasswordRequestDto;
import com.itwizard.swaedu.modules.auth.dto.response.UserResponseDto;
import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.UnauthorizedException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.auth.mapper.AuthMapper;
import com.itwizard.swaedu.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        return AuthMapper.toUserResponseDto(user);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequestDto request) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Check if new password is the same as current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ValidationException("New password cannot be the same as current password");
        }

        // Additional password validation (length is already validated by DTO, but double-check for security)
        String newPassword = request.getNewPassword();
        if (newPassword.length() < 8) {
            throw new ValidationException("New password must be at least 8 characters long");
        }
        if (newPassword.length() > 100) {
            throw new ValidationException("New password must be at most 100 characters long");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

