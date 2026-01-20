package com.itwizard.swaedu.modules.teacher.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.teacher.dto.request.RegisterTeacherRequestDto;
import com.itwizard.swaedu.modules.teacher.dto.request.TeacherUpdateDto;
import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import com.itwizard.swaedu.modules.teacher.mapper.TeacherMapper;
import com.itwizard.swaedu.modules.teacher.repository.TeacherRepository;
import com.itwizard.swaedu.modules.teacher.entity.Teacher;
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
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public TeacherResponseDto registerTeacher(RegisterTeacherRequestDto request) {
        // Check if user already exists
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new ValidationException("User already exists");
        }

        // Get TEACHER role
        Role teacherRole = roleRepository.findByName("TEACHER")
                .orElseThrow(() -> new ResourceNotFoundException("TEACHER role not found"));

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(teacherRole);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        // Create teacher profile
        Teacher teacher = new Teacher();
        teacher.setUser(savedUser);
        teacher.setTeacherId("TID" + savedUser.getId());
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setPhone(request.getPhone());

        Teacher savedTeacher = teacherRepository.save(teacher);
        return TeacherMapper.toResponseDto(savedTeacher);
    }

    @Override
    public PageResponse<TeacherResponseDto> listTeachers(String q, Integer page, Integer size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<Teacher> pageResult = teacherRepository.search(q, pageable);
        return buildPageResponse(pageResult);
    }

    @Override
    public TeacherResponseDto getTeacherById(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with userId: " + userId));
        return TeacherMapper.toResponseDto(teacher);
    }

    @Override
    @Transactional
    public TeacherResponseDto updateTeacher(Long userId, TeacherUpdateDto request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with userId: " + userId));

        TeacherMapper.updateEntityFromDto(teacher, request);
        Teacher updatedTeacher = teacherRepository.save(teacher);
        return TeacherMapper.toResponseDto(updatedTeacher);
    }

    @Override
    @Transactional(readOnly = true)
    public void exportTeachersToExcel(OutputStream outputStream, String q) throws IOException {
        // Use SXSSFWorkbook for streaming Excel export (memory-efficient)
        // Window size of 100: keeps only last 100 rows in memory, flushes older rows to temp files
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            // Compress temp files to reduce disk space usage
            workbook.setCompressTempFiles(true);

            Sheet sheet = workbook.createSheet("Teachers");

            // Create header row
            Row headerRow = sheet.createRow(0);
            int colNum = 0;
            headerRow.createCell(colNum++).setCellValue("Teacher ID");
            headerRow.createCell(colNum++).setCellValue("Name");
            headerRow.createCell(colNum++).setCellValue("Username");
            headerRow.createCell(colNum++).setCellValue("Email");
            headerRow.createCell(colNum++).setCellValue("Phone");

            // Stream data from database and write rows
            AtomicInteger rowNum = new AtomicInteger(1);
            try (Stream<Teacher> teacherStream = teacherRepository.streamForExport(q)) {
                
                teacherStream.forEach(teacher -> {
                    Row row = sheet.createRow(rowNum.getAndIncrement());
                    int cellNum = 0;
                    
                    // Teacher ID
                    row.createCell(cellNum++).setCellValue(teacher.getTeacherId() != null ? teacher.getTeacherId() : "");
                    // Name
                    row.createCell(cellNum++).setCellValue(teacher.getName() != null ? teacher.getName() : "");
                    // Username
                    row.createCell(cellNum++).setCellValue(teacher.getUser() != null && teacher.getUser().getUsername() != null ? teacher.getUser().getUsername() : "");
                    // Email
                    row.createCell(cellNum++).setCellValue(teacher.getEmail() != null ? teacher.getEmail() : "");
                    // Phone
                    row.createCell(cellNum++).setCellValue(teacher.getPhone() != null ? teacher.getPhone() : "");
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

    private PageResponse<TeacherResponseDto> buildPageResponse(Page<Teacher> pageResult) {
        List<TeacherResponseDto> items = TeacherMapper.toResponseDtoList(pageResult.getContent());
        return PageResponse.<TeacherResponseDto>builder()
                .items(items)
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }
}
