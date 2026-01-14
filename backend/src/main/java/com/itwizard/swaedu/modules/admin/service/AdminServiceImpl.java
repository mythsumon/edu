package com.itwizard.swaedu.modules.admin.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.admin.dto.request.AdminPatchDto;
import com.itwizard.swaedu.modules.admin.dto.request.AdminUpdateDto;
import com.itwizard.swaedu.modules.admin.dto.request.RegisterAdminRequestDto;
import com.itwizard.swaedu.modules.admin.dto.response.AdminResponseDto;
import com.itwizard.swaedu.modules.admin.mapper.AdminMapper;
import com.itwizard.swaedu.modules.admin.repository.AdminRepository;
import com.itwizard.swaedu.modules.auth.entity.Admin;
import com.itwizard.swaedu.modules.auth.entity.Role;
import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.auth.repository.RoleRepository;
import com.itwizard.swaedu.modules.auth.repository.UserRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AdminResponseDto registerAdmin(RegisterAdminRequestDto request) {
        // Check if user already exists
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new ValidationException("User already exists");
        }

        // Get ADMIN role
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new ResourceNotFoundException("ADMIN role not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(adminRole);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        // Create admin profile
        Admin admin = new Admin();
        admin.setUser(savedUser);
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());

        Admin savedAdmin = adminRepository.save(admin);
        return AdminMapper.toResponseDto(savedAdmin);
    }

    @Override
    public PageResponse<AdminResponseDto> listAdmins(String q, Integer page, Integer size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<Admin> pageResult = adminRepository.search(q, pageable);
        return buildPageResponse(pageResult);
    }

    @Override
    public AdminResponseDto getAdminById(Long userId) {
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with userId: " + userId));
        return AdminMapper.toResponseDto(admin);
    }

    @Override
    @Transactional
    public AdminResponseDto updateAdmin(Long userId, AdminUpdateDto request) {
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with userId: " + userId));
        
        AdminMapper.updateEntityFromDto(admin, request);
        Admin updatedAdmin = adminRepository.save(admin);
        return AdminMapper.toResponseDto(updatedAdmin);
    }

    @Override
    @Transactional
    public AdminResponseDto patchAdmin(Long userId, AdminPatchDto request) {
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with userId: " + userId));
        
        AdminMapper.patchEntityFromDto(admin, request);
        Admin updatedAdmin = adminRepository.save(admin);
        return AdminMapper.toResponseDto(updatedAdmin);
    }

    @Override
    @Transactional
    public void deleteAdmin(Long userId) {
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with userId: " + userId));
        
        // Delete admin (cascade will delete user due to orphanRemoval = true)
        adminRepository.delete(admin);
    }

    // Private helper methods

    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int pageNumber = page != null && page >= 0 ? page : 0;
        int pageSize = size != null && size > 0 ? size : 20;

        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            if (sortParts.length == 2) {
                String property = sortParts[0].trim();
                Sort.Direction direction = "desc".equalsIgnoreCase(sortParts[1].trim())
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;
                return PageRequest.of(pageNumber, pageSize, Sort.by(direction, property));
            }
        }

        return PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.ASC, "userId"));
    }

    private PageResponse<AdminResponseDto> buildPageResponse(Page<Admin> pageResult) {
        List<AdminResponseDto> items = AdminMapper.toResponseDtoList(pageResult.getContent());
        return PageResponse.<AdminResponseDto>builder()
                .items(items)
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }
}
