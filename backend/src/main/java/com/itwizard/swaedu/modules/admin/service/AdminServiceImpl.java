package com.itwizard.swaedu.modules.admin.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.admin.dto.request.AdminPatchDto;
import com.itwizard.swaedu.modules.admin.dto.request.AdminUpdateDto;
import com.itwizard.swaedu.modules.admin.dto.request.RegisterAdminRequestDto;
import com.itwizard.swaedu.modules.admin.dto.response.AdminResponseDto;
import com.itwizard.swaedu.modules.admin.mapper.AdminMapper;
import com.itwizard.swaedu.modules.admin.repository.AdminRepository;
import com.itwizard.swaedu.modules.admin.entity.Admin;
import com.itwizard.swaedu.modules.auth.entity.Role;
import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.auth.repository.RoleRepository;
import com.itwizard.swaedu.modules.auth.repository.UserRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

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
        admin.setName(request.getName());
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
    public AdminResponseDto getAdminByUsername(String username) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with username: " + username));
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
    public AdminResponseDto updateAdminByUsername(String username, AdminUpdateDto request) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with username: " + username));
        
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

    @Override
    @Transactional(readOnly = true)
    public void exportAdminsToExcel(OutputStream outputStream, String q) throws IOException {
        // Use SXSSFWorkbook for streaming Excel export (memory-efficient)
        // Window size of 100: keeps only last 100 rows in memory, flushes older rows to temp files
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            // Compress temp files to reduce disk space usage
            workbook.setCompressTempFiles(true);

            Sheet sheet = workbook.createSheet("Admins");

            // Create header row
            Row headerRow = sheet.createRow(0);
            int colNum = 0;
            headerRow.createCell(colNum++).setCellValue("Admin ID");
            headerRow.createCell(colNum++).setCellValue("Name");
            headerRow.createCell(colNum++).setCellValue("Username");
            headerRow.createCell(colNum++).setCellValue("Email");
            headerRow.createCell(colNum++).setCellValue("Phone");

            // Stream data from database and write rows
            AtomicInteger rowNum = new AtomicInteger(1);
            try (Stream<Admin> adminStream = adminRepository.streamForExport(q)) {
                
                adminStream.forEach(admin -> {
                    Row row = sheet.createRow(rowNum.getAndIncrement());
                    int cellNum = 0;
                    
                    // Admin ID
                    row.createCell(cellNum++).setCellValue(admin.getUserId() != null ? String.valueOf(admin.getUserId()) : "");
                    // Name
                    row.createCell(cellNum++).setCellValue(admin.getName() != null ? admin.getName() : "");
                    // Username
                    row.createCell(cellNum++).setCellValue(admin.getUser() != null && admin.getUser().getUsername() != null ? admin.getUser().getUsername() : "");
                    // Email
                    row.createCell(cellNum++).setCellValue(admin.getEmail() != null ? admin.getEmail() : "");
                    // Phone
                    row.createCell(cellNum++).setCellValue(admin.getPhone() != null ? admin.getPhone() : "");
                });
            }

            // Write workbook to output stream
            workbook.write(outputStream);
            workbook.dispose(); // Clean up temp files
        }
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
