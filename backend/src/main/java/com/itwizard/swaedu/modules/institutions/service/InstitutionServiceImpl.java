package com.itwizard.swaedu.modules.institutions.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionCreateDto;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionUpdateDto;
import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.modules.institutions.entity.InstitutionEntity;
import com.itwizard.swaedu.modules.institutions.mapper.InstitutionMapper;
import com.itwizard.swaedu.modules.institutions.repository.InstitutionRepository;
import com.itwizard.swaedu.modules.mastercode.repository.MasterCodeRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class InstitutionServiceImpl implements InstitutionService {

    private final InstitutionRepository repository;
    private final MasterCodeRepository masterCodeRepository;

    @Override
    @Transactional
    public InstitutionResponseDto createInstitution(InstitutionCreateDto request) {
        // Validate foreign key references if provided
        if (request.getDistrictId() != null) {
            validateMasterCodeExists(request.getDistrictId(), "District");
        }
        if (request.getZoneId() != null) {
            validateMasterCodeExists(request.getZoneId(), "Zone");
        }
        if (request.getRegionId() != null) {
            validateMasterCodeExists(request.getRegionId(), "Region");
        }
        if (request.getMajorCategoryId() != null) {
            validateMasterCodeExists(request.getMajorCategoryId(), "Major category");
        }
        if (request.getCategoryOneId() != null) {
            validateMasterCodeExists(request.getCategoryOneId(), "Category one");
        }
        if (request.getCategoryTwoId() != null) {
            validateMasterCodeExists(request.getCategoryTwoId(), "Category two");
        }
        if (request.getClassificationId() != null) {
            validateMasterCodeExists(request.getClassificationId(), "Classification");
        }

        // Create entity
        InstitutionEntity entity = InstitutionMapper.toEntity(request);
        
        // Generate institution_id before saving
        String institutionId = generateInstitutionId();
        entity.setInstitutionId(institutionId);
        
        InstitutionEntity saved = repository.save(entity);
        return InstitutionMapper.toResponseDto(saved);
    }

    @Override
    public PageResponse<InstitutionResponseDto> listInstitutions(
            String q,
            Integer page,
            Integer size,
            String sort,
            List<Long> majorCategoryIds,
            List<Long> categoryOneIds,
            List<Long> categoryTwoIds,
            List<Long> classificationIds,
            Long districtId,
            List<Long> zoneIds,
            List<Long> regionIds,
            Long teacherId) {
        // Parse sort parameter
        Pageable pageable = buildPageable(page, size, sort);

        // Normalize empty lists to null for JPQL query (empty lists cause issues with IN clause)
        List<Long> normalizedMajorCategoryIds = (majorCategoryIds != null && majorCategoryIds.isEmpty()) ? null : majorCategoryIds;
        List<Long> normalizedCategoryOneIds = (categoryOneIds != null && categoryOneIds.isEmpty()) ? null : categoryOneIds;
        List<Long> normalizedCategoryTwoIds = (categoryTwoIds != null && categoryTwoIds.isEmpty()) ? null : categoryTwoIds;
        List<Long> normalizedClassificationIds = (classificationIds != null && classificationIds.isEmpty()) ? null : classificationIds;
        List<Long> normalizedZoneIds = (zoneIds != null && zoneIds.isEmpty()) ? null : zoneIds;
        List<Long> normalizedRegionIds = (regionIds != null && regionIds.isEmpty()) ? null : regionIds;

        // Search with filters
        Page<InstitutionEntity> pageResult = repository.search(
                q, normalizedMajorCategoryIds, normalizedCategoryOneIds, normalizedCategoryTwoIds, normalizedClassificationIds,
                districtId, normalizedZoneIds, normalizedRegionIds, teacherId, pageable);

        return buildPageResponse(pageResult);
    }

    @Override
    public InstitutionResponseDto getInstitutionById(Long id) {
        InstitutionEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));
        return InstitutionMapper.toResponseDto(entity);
    }

    @Override
    @Transactional
    public InstitutionResponseDto updateInstitution(Long id, InstitutionUpdateDto request) {
        InstitutionEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));

        // Validate foreign key references if provided
        if (request.getDistrictId() != null) {
            validateMasterCodeExists(request.getDistrictId(), "District");
        }
        if (request.getZoneId() != null) {
            validateMasterCodeExists(request.getZoneId(), "Zone");
        }
        if (request.getRegionId() != null) {
            validateMasterCodeExists(request.getRegionId(), "Region");
        }
        if (request.getMajorCategoryId() != null) {
            validateMasterCodeExists(request.getMajorCategoryId(), "Major category");
        }
        if (request.getCategoryOneId() != null) {
            validateMasterCodeExists(request.getCategoryOneId(), "Category one");
        }
        if (request.getCategoryTwoId() != null) {
            validateMasterCodeExists(request.getCategoryTwoId(), "Category two");
        }
        if (request.getClassificationId() != null) {
            validateMasterCodeExists(request.getClassificationId(), "Classification");
        }

        // Update entity
        InstitutionMapper.updateEntityFromDto(entity, request);
        entity.setUpdatedAt(LocalDateTime.now());

        InstitutionEntity updated = repository.save(entity);
        return InstitutionMapper.toResponseDto(updated);
    }

    @Override
    @Transactional
    public void deleteInstitution(Long id) {
        InstitutionEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));

        // Soft delete
        entity.setIsDelete(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public void exportInstitutionsToExcel(
            OutputStream outputStream,
            String q,
            List<Long> majorCategoryIds,
            List<Long> categoryOneIds,
            List<Long> categoryTwoIds,
            List<Long> classificationIds,
            Long districtId,
            List<Long> zoneIds,
            List<Long> regionIds,
            Long teacherId) throws IOException {
        
        // Normalize empty lists to null for JPQL query (empty lists cause issues with IN clause)
        List<Long> normalizedMajorCategoryIds = (majorCategoryIds != null && majorCategoryIds.isEmpty()) ? null : majorCategoryIds;
        List<Long> normalizedCategoryOneIds = (categoryOneIds != null && categoryOneIds.isEmpty()) ? null : categoryOneIds;
        List<Long> normalizedCategoryTwoIds = (categoryTwoIds != null && categoryTwoIds.isEmpty()) ? null : categoryTwoIds;
        List<Long> normalizedClassificationIds = (classificationIds != null && classificationIds.isEmpty()) ? null : classificationIds;
        List<Long> normalizedZoneIds = (zoneIds != null && zoneIds.isEmpty()) ? null : zoneIds;
        List<Long> normalizedRegionIds = (regionIds != null && regionIds.isEmpty()) ? null : regionIds;

        // Use SXSSFWorkbook for streaming Excel export (memory-efficient)
        // Window size of 100: keeps only last 100 rows in memory, flushes older rows to temp files
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            // Compress temp files to reduce disk space usage
            workbook.setCompressTempFiles(true);

            Sheet sheet = workbook.createSheet("Institutions");

            // Create header row
            Row headerRow = sheet.createRow(0);
            int colNum = 0;
            headerRow.createCell(colNum++).setCellValue("Institution ID");
            headerRow.createCell(colNum++).setCellValue("Name");
            headerRow.createCell(colNum++).setCellValue("Phone Number");
            headerRow.createCell(colNum++).setCellValue("Street");
            headerRow.createCell(colNum++).setCellValue("Address");
            headerRow.createCell(colNum++).setCellValue("District Name");
            headerRow.createCell(colNum++).setCellValue("Zone Name");
            headerRow.createCell(colNum++).setCellValue("Region Name");
            headerRow.createCell(colNum++).setCellValue("Major Category Name");
            headerRow.createCell(colNum++).setCellValue("Category One Name");
            headerRow.createCell(colNum++).setCellValue("Category Two Name");
            headerRow.createCell(colNum++).setCellValue("Classification Name");
            headerRow.createCell(colNum++).setCellValue("Teacher Name");
            headerRow.createCell(colNum++).setCellValue("Notes");

            // Stream data from database and write rows
            AtomicInteger rowNum = new AtomicInteger(1);
            try (Stream<InstitutionEntity> institutionStream = repository.streamForExport(
                    q, normalizedMajorCategoryIds, normalizedCategoryOneIds, normalizedCategoryTwoIds,
                    normalizedClassificationIds, districtId, normalizedZoneIds, normalizedRegionIds, teacherId)) {
                
                institutionStream.forEach(institution -> {
                    Row row = sheet.createRow(rowNum.getAndIncrement());
                    int cellNum = 0;
                    
                    // Institution ID
                    row.createCell(cellNum++).setCellValue(institution.getInstitutionId() != null ? institution.getInstitutionId() : "");
                    // Name
                    row.createCell(cellNum++).setCellValue(institution.getName() != null ? institution.getName() : "");
                    // Phone Number
                    row.createCell(cellNum++).setCellValue(institution.getPhoneNumber() != null ? institution.getPhoneNumber() : "");
                    // Street
                    row.createCell(cellNum++).setCellValue(institution.getStreet() != null ? institution.getStreet() : "");
                    // Address
                    row.createCell(cellNum++).setCellValue(institution.getAddress() != null ? institution.getAddress() : "");
                    // District Name
                    row.createCell(cellNum++).setCellValue(institution.getDistrict() != null && institution.getDistrict().getCodeName() != null ? institution.getDistrict().getCodeName() : "");
                    // Zone Name
                    row.createCell(cellNum++).setCellValue(institution.getZone() != null && institution.getZone().getCodeName() != null ? institution.getZone().getCodeName() : "");
                    // Region Name
                    row.createCell(cellNum++).setCellValue(institution.getRegion() != null && institution.getRegion().getCodeName() != null ? institution.getRegion().getCodeName() : "");
                    // Major Category Name
                    row.createCell(cellNum++).setCellValue(institution.getMajorCategory() != null && institution.getMajorCategory().getCodeName() != null ? institution.getMajorCategory().getCodeName() : "");
                    // Category One Name
                    row.createCell(cellNum++).setCellValue(institution.getCategoryOne() != null && institution.getCategoryOne().getCodeName() != null ? institution.getCategoryOne().getCodeName() : "");
                    // Category Two Name
                    row.createCell(cellNum++).setCellValue(institution.getCategoryTwo() != null && institution.getCategoryTwo().getCodeName() != null ? institution.getCategoryTwo().getCodeName() : "");
                    // Classification Name
                    row.createCell(cellNum++).setCellValue(institution.getClassification() != null && institution.getClassification().getCodeName() != null ? institution.getClassification().getCodeName() : "");
                    // Teacher Name
                    row.createCell(cellNum++).setCellValue(institution.getTeacher() != null && institution.getTeacher().getName() != null ? institution.getTeacher().getName() : "");
                    // Notes
                    row.createCell(cellNum++).setCellValue(institution.getNotes() != null ? institution.getNotes() : "");
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

    private void validateMasterCodeExists(Long id, String fieldName) {
        masterCodeRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException(fieldName + " not found with id: " + id));
    }

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

        return PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.ASC, "name"));
    }

    private PageResponse<InstitutionResponseDto> buildPageResponse(Page<InstitutionEntity> pageResult) {
        return PageResponse.<InstitutionResponseDto>builder()
                .items(InstitutionMapper.toResponseDtoList(pageResult.getContent()))
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    /**
     * Generate institution_id in format: INT{YearMonthDay}{serial number}
     * Example: INT2024031505 (created on 2024-03-15, 5th institution of the day)
     */
    private String generateInstitutionId() {
        LocalDate today = LocalDate.now();
        String dateStr = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // Count institutions created on the same date
        long count = repository.countByCreatedAtDate(today);
        
        // Serial number is count + 1 (zero-padded to 2 digits minimum)
        long serialNumber = count + 1;
        String serialStr = String.format("%02d", serialNumber);
        
        return "INT" + dateStr + serialStr;
    }
}
