package com.itwizard.swaedu.modules.instructor.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.exception.ValidationException;
import com.itwizard.swaedu.modules.instructor.dto.request.InstructorPatchDto;
import com.itwizard.swaedu.modules.instructor.dto.request.InstructorUpdateDto;
import com.itwizard.swaedu.modules.instructor.dto.request.RegisterInstructorRequestDto;
import com.itwizard.swaedu.modules.instructor.dto.response.InstructorResponseDto;
import com.itwizard.swaedu.modules.instructor.mapper.InstructorMapper;
import com.itwizard.swaedu.modules.instructor.repository.InstructorRepository;
import com.itwizard.swaedu.modules.instructor.entity.Instructor;
import com.itwizard.swaedu.modules.auth.entity.Role;
import com.itwizard.swaedu.modules.auth.entity.User;
import com.itwizard.swaedu.modules.auth.repository.RoleRepository;
import com.itwizard.swaedu.modules.auth.repository.UserRepository;
import com.itwizard.swaedu.modules.mastercode.entity.MasterCodeEntity;
import com.itwizard.swaedu.modules.mastercode.repository.MasterCodeRepository;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class InstructorServiceImpl implements InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MasterCodeRepository masterCodeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public InstructorResponseDto registerInstructor(RegisterInstructorRequestDto request) {
        // Check if user already exists
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new ValidationException("User already exists");
        }

        // Check if email already exists for instructors
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && instructorRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists for another instructor");
        }

        // Get INSTRUCTOR role
        Role instructorRole = roleRepository.findByName("INSTRUCTOR")
                .orElseThrow(() -> new ResourceNotFoundException("INSTRUCTOR role not found"));

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(instructorRole);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        // Create instructor profile
        Instructor instructor = new Instructor();
        instructor.setUser(savedUser);
        instructor.setName(request.getName());
        instructor.setEmail(request.getEmail());
        instructor.setPhone(request.getPhone());
        instructor.setGender(request.getGender());
        instructor.setDob(request.getDob());
        instructor.setRegionId(request.getRegionId());
        instructor.setCity(request.getCity());
        instructor.setStreet(request.getStreet());
        instructor.setDetailAddress(request.getDetailAddress());
        instructor.setStatusId(request.getStatusId());
        instructor.setClassificationId(request.getClassificationId());
        instructor.setAffiliation(request.getAffiliation());

        // Set region if provided
        if (request.getRegionId() != null) {
            MasterCodeEntity region = masterCodeRepository.findByIdAndIsDeleteFalse(request.getRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region master code not found with id: " + request.getRegionId()));
            instructor.setRegion(region);
        }

        // Set status if provided
        if (request.getStatusId() != null) {
            MasterCodeEntity status = masterCodeRepository.findByIdAndIsDeleteFalse(request.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status master code not found with id: " + request.getStatusId()));
            instructor.setStatus(status);
        }

        // Set classification if provided
        if (request.getClassificationId() != null) {
            MasterCodeEntity classification = masterCodeRepository.findByIdAndIsDeleteFalse(request.getClassificationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classification master code not found with id: " + request.getClassificationId()));
            instructor.setClassification(classification);
        }

        Instructor savedInstructor = instructorRepository.save(instructor);
        return InstructorMapper.toResponseDto(savedInstructor);
    }

    @Override
    public PageResponse<InstructorResponseDto> listInstructors(
            String q, Integer page, Integer size, String sort,
            List<Long> regionIds, List<Long> classificationIds, List<Long> statusIds, List<Long> zoneIds) {
        Pageable pageable = buildPageable(page, size, sort);
        
        // Normalize empty lists to null for JPQL query (empty lists cause issues with IN clause)
        List<Long> normalizedRegionIds = (regionIds != null && regionIds.isEmpty()) ? null : regionIds;
        List<Long> normalizedClassificationIds = (classificationIds != null && classificationIds.isEmpty()) ? null : classificationIds;
        List<Long> normalizedStatusIds = (statusIds != null && statusIds.isEmpty()) ? null : statusIds;
        List<Long> normalizedZoneIds = (zoneIds != null && zoneIds.isEmpty()) ? null : zoneIds;
        
        // If zoneIds are provided, find all regions that belong to those zones
        List<Long> finalRegionIds = normalizedRegionIds;
        if (normalizedZoneIds != null && !normalizedZoneIds.isEmpty()) {
            // Find all regions where parentId is in the zoneIds list
            // For multiple zones, we need to find regions for each zone
            List<Long> regionIdsFromZones = normalizedZoneIds.stream()
                    .flatMap(zoneId -> masterCodeRepository.findByParentIdAndIsDeleteFalse(zoneId).stream())
                    .map(MasterCodeEntity::getId)
                    .distinct()
                    .toList();
            
            // Combine with explicitly provided regionIds
            if (normalizedRegionIds != null && !normalizedRegionIds.isEmpty()) {
                // Intersection: only regions that are in both lists
                finalRegionIds = normalizedRegionIds.stream()
                        .filter(regionIdsFromZones::contains)
                        .toList();
                // If intersection is empty, set to null to return no results
                if (finalRegionIds.isEmpty()) {
                    finalRegionIds = null;
                }
            } else {
                // Use regions from zones
                finalRegionIds = regionIdsFromZones.isEmpty() ? null : regionIdsFromZones;
            }
        }
        
        Page<Instructor> pageResult = instructorRepository.search(
                q, finalRegionIds, normalizedClassificationIds, normalizedStatusIds, pageable);
        return buildPageResponse(pageResult);
    }

    @Override
    public InstructorResponseDto getInstructorById(Long userId) {
        Instructor instructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with userId: " + userId));
        return InstructorMapper.toResponseDto(instructor);
    }

    @Override
    @Transactional
    public InstructorResponseDto updateInstructor(Long userId, InstructorUpdateDto request) {
        Instructor instructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with userId: " + userId));

        // Check email uniqueness if email is being changed
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equals(instructor.getEmail())
                && instructorRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists for another instructor");
        }

        // Update basic fields
        InstructorMapper.updateEntityFromDto(instructor, request);

        // Update region if provided
        if (request.getRegionId() != null) {
            MasterCodeEntity region = masterCodeRepository.findByIdAndIsDeleteFalse(request.getRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region master code not found with id: " + request.getRegionId()));
            instructor.setRegion(region);
        } else {
            instructor.setRegion(null);
        }

        // Update status if provided
        if (request.getStatusId() != null) {
            MasterCodeEntity status = masterCodeRepository.findByIdAndIsDeleteFalse(request.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status master code not found with id: " + request.getStatusId()));
            instructor.setStatus(status);
        } else {
            instructor.setStatus(null);
        }

        // Update classification if provided
        if (request.getClassificationId() != null) {
            MasterCodeEntity classification = masterCodeRepository.findByIdAndIsDeleteFalse(request.getClassificationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classification master code not found with id: " + request.getClassificationId()));
            instructor.setClassification(classification);
        } else {
            instructor.setClassification(null);
        }

        Instructor updatedInstructor = instructorRepository.save(instructor);
        return InstructorMapper.toResponseDto(updatedInstructor);
    }

    @Override
    @Transactional
    public InstructorResponseDto patchInstructor(Long userId, InstructorPatchDto request) {
        Instructor instructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with userId: " + userId));

        // Check email uniqueness if email is being changed
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equals(instructor.getEmail())
                && instructorRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists for another instructor");
        }

        // Update basic fields (only non-null fields)
        InstructorMapper.patchEntityFromDto(instructor, request);

        // Update region if provided
        if (request.getRegionId() != null) {
            MasterCodeEntity region = masterCodeRepository.findByIdAndIsDeleteFalse(request.getRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region master code not found with id: " + request.getRegionId()));
            instructor.setRegion(region);
        }

        // Update status if provided
        if (request.getStatusId() != null) {
            MasterCodeEntity status = masterCodeRepository.findByIdAndIsDeleteFalse(request.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status master code not found with id: " + request.getStatusId()));
            instructor.setStatus(status);
        }

        // Update classification if provided
        if (request.getClassificationId() != null) {
            MasterCodeEntity classification = masterCodeRepository.findByIdAndIsDeleteFalse(request.getClassificationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classification master code not found with id: " + request.getClassificationId()));
            instructor.setClassification(classification);
        }

        Instructor updatedInstructor = instructorRepository.save(instructor);
        return InstructorMapper.toResponseDto(updatedInstructor);
    }

    @Override
    @Transactional
    public void deleteInstructor(Long userId) {
        Instructor instructor = instructorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with userId: " + userId));

        // Delete instructor (cascade will delete user due to orphanRemoval = true)
        instructorRepository.delete(instructor);
    }

    @Override
    @Transactional(readOnly = true)
    public void exportInstructorsToExcel(
            OutputStream outputStream,
            String q,
            List<Long> regionIds,
            List<Long> classificationIds,
            List<Long> statusIds,
            List<Long> zoneIds) throws IOException {
        
        // Normalize empty lists to null for JPQL query (empty lists cause issues with IN clause)
        List<Long> normalizedRegionIds = (regionIds != null && regionIds.isEmpty()) ? null : regionIds;
        List<Long> normalizedClassificationIds = (classificationIds != null && classificationIds.isEmpty()) ? null : classificationIds;
        List<Long> normalizedStatusIds = (statusIds != null && statusIds.isEmpty()) ? null : statusIds;
        List<Long> normalizedZoneIds = (zoneIds != null && zoneIds.isEmpty()) ? null : zoneIds;
        
        // If zoneIds are provided, find all regions that belong to those zones
        List<Long> finalRegionIds = normalizedRegionIds;
        if (normalizedZoneIds != null && !normalizedZoneIds.isEmpty()) {
            // Find all regions where parentId is in the zoneIds list
            List<Long> regionIdsFromZones = normalizedZoneIds.stream()
                    .flatMap(zoneId -> masterCodeRepository.findByParentIdAndIsDeleteFalse(zoneId).stream())
                    .map(MasterCodeEntity::getId)
                    .distinct()
                    .toList();
            
            // Combine with explicitly provided regionIds
            if (normalizedRegionIds != null && !normalizedRegionIds.isEmpty()) {
                // Intersection: only regions that are in both lists
                finalRegionIds = normalizedRegionIds.stream()
                        .filter(regionIdsFromZones::contains)
                        .toList();
                // If intersection is empty, set to null to return no results
                if (finalRegionIds.isEmpty()) {
                    finalRegionIds = null;
                }
            } else {
                // Use regions from zones
                finalRegionIds = regionIdsFromZones.isEmpty() ? null : regionIdsFromZones;
            }
        }

        // Use SXSSFWorkbook for streaming Excel export (memory-efficient)
        // Window size of 100: keeps only last 100 rows in memory, flushes older rows to temp files
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            // Compress temp files to reduce disk space usage
            workbook.setCompressTempFiles(true);

            Sheet sheet = workbook.createSheet("Instructors");

            // Create header row
            Row headerRow = sheet.createRow(0);
            int colNum = 0;
            headerRow.createCell(colNum++).setCellValue("Instructor ID");
            headerRow.createCell(colNum++).setCellValue("Name");
            headerRow.createCell(colNum++).setCellValue("Username");
            headerRow.createCell(colNum++).setCellValue("Email");
            headerRow.createCell(colNum++).setCellValue("Phone");
            headerRow.createCell(colNum++).setCellValue("Gender");
            headerRow.createCell(colNum++).setCellValue("Date of Birth");
            headerRow.createCell(colNum++).setCellValue("Affiliation");
            headerRow.createCell(colNum++).setCellValue("Region Name");
            headerRow.createCell(colNum++).setCellValue("Classification Name");
            headerRow.createCell(colNum++).setCellValue("Status Name");
            headerRow.createCell(colNum++).setCellValue("City");
            headerRow.createCell(colNum++).setCellValue("Street");
            headerRow.createCell(colNum++).setCellValue("Building Name / Lake Number");

            // Date formatter
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MM.dd.yyyy");

            // Stream data from database and write rows
            AtomicInteger rowNum = new AtomicInteger(1);
            try (Stream<Instructor> instructorStream = instructorRepository.streamForExport(
                    q, finalRegionIds, normalizedClassificationIds, normalizedStatusIds)) {
                
                instructorStream.forEach(instructor -> {
                    Row row = sheet.createRow(rowNum.getAndIncrement());
                    int cellNum = 0;
                    
                    // Instructor ID
                    row.createCell(cellNum++).setCellValue(instructor.getUserId() != null ? String.valueOf(instructor.getUserId()) : "");
                    // Name
                    row.createCell(cellNum++).setCellValue(instructor.getName() != null ? instructor.getName() : "");
                    // Username
                    row.createCell(cellNum++).setCellValue(instructor.getUser() != null && instructor.getUser().getUsername() != null ? instructor.getUser().getUsername() : "");
                    // Email
                    row.createCell(cellNum++).setCellValue(instructor.getEmail() != null ? instructor.getEmail() : "");
                    // Phone
                    row.createCell(cellNum++).setCellValue(instructor.getPhone() != null ? instructor.getPhone() : "");
                    // Gender
                    row.createCell(cellNum++).setCellValue(instructor.getGender() != null ? instructor.getGender() : "");
                    // Date of Birth
                    row.createCell(cellNum++).setCellValue(instructor.getDob() != null ? instructor.getDob().format(dateFormatter) : "");
                    // Affiliation
                    row.createCell(cellNum++).setCellValue(instructor.getAffiliation() != null ? instructor.getAffiliation() : "");
                    // Region Name
                    row.createCell(cellNum++).setCellValue(instructor.getRegion() != null && instructor.getRegion().getCodeName() != null ? instructor.getRegion().getCodeName() : "");
                    // Classification Name
                    row.createCell(cellNum++).setCellValue(instructor.getClassification() != null && instructor.getClassification().getCodeName() != null ? instructor.getClassification().getCodeName() : "");
                    // Status Name
                    row.createCell(cellNum++).setCellValue(instructor.getStatus() != null && instructor.getStatus().getCodeName() != null ? instructor.getStatus().getCodeName() : "");
                    // City
                    row.createCell(cellNum++).setCellValue(instructor.getCity() != null ? instructor.getCity() : "");
                    // Street
                    row.createCell(cellNum++).setCellValue(instructor.getStreet() != null ? instructor.getStreet() : "");
                    // Building Name / Lake Number
                    row.createCell(cellNum++).setCellValue(instructor.getDetailAddress() != null ? instructor.getDetailAddress() : "");
                });
            }

            // Write workbook to output stream
            workbook.write(outputStream);
            outputStream.flush();
            
            // Dispose to clean up temporary files created by SXSSFWorkbook
            workbook.dispose();
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

    private PageResponse<InstructorResponseDto> buildPageResponse(Page<Instructor> pageResult) {
        List<InstructorResponseDto> items = InstructorMapper.toResponseDtoList(pageResult.getContent());
        return PageResponse.<InstructorResponseDto>builder()
                .items(items)
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }
}
