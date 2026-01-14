package com.itwizard.swaedu.modules.auth.service;

import com.itwizard.swaedu.modules.auth.entity.*;
import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.UnauthorizedException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.auth.dto.request.LoginRequestDto;
import com.itwizard.swaedu.modules.auth.dto.response.LoginResponseDto;
import com.itwizard.swaedu.modules.auth.dto.request.RegisterRequestDto;
import com.itwizard.swaedu.modules.auth.repository.*;
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
    private final RoleRepository roleRepository;
    private final InstructorRepository instructorRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User register(RegisterRequestDto request) {
        // Check if user already exists
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new ValidationException("User already exists");
        }

        // Check if email already exists for instructors
        if (request.getEmail() != null && !request.getEmail().isBlank() 
                && instructorRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        // Get INSTRUCTOR role
        Role instructorRole = roleRepository.findByName("INSTRUCTOR")
                .orElseThrow(() -> new ResourceNotFoundException("INSTRUCTOR role not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(instructorRole);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        // Create instructor profile
        Instructor instructor = new Instructor();
        instructor.setUser(savedUser);
        instructor.setFirstName(request.getFirstName());
        instructor.setLastName(request.getLastName());
        instructor.setEmail(request.getEmail());
        instructor.setPhone(request.getPhone());
        instructor.setGender(request.getGender());
        instructor.setDob(request.getDob());
        instructor.setCity(request.getCity());
        instructor.setStreet(request.getStreet());
        instructor.setDetailAddress(request.getDetailAddress());
        instructorRepository.save(instructor);

        return savedUser;
    }

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
