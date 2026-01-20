package com.itwizard.swaedu.modules.program.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.modules.mastercode.repository.MasterCodeRepository;
import com.itwizard.swaedu.modules.program.dto.request.ProgramCreateDto;
import com.itwizard.swaedu.modules.program.dto.request.ProgramUpdateDto;
import com.itwizard.swaedu.modules.program.dto.response.ProgramResponseDto;
import com.itwizard.swaedu.modules.program.entity.ProgramEntity;
import com.itwizard.swaedu.modules.program.mapper.ProgramMapper;
import com.itwizard.swaedu.modules.program.repository.ProgramRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ProgramServiceImpl implements ProgramService {

    private final ProgramRepository repository;
    private final MasterCodeRepository masterCodeRepository;

    @Override
    @Transactional
    public ProgramResponseDto createProgram(ProgramCreateDto request) {
        // Validate foreign key references
        validateMasterCodeExists(request.getSessionPartId(), "Session/Part");
        validateMasterCodeExists(request.getStatusId(), "Status");
        if (request.getProgramTypeId() != null) {
            validateMasterCodeExists(request.getProgramTypeId(), "Program Type");
        }

        // Create entity
        ProgramEntity entity = ProgramMapper.toEntity(request);
        ProgramEntity saved = repository.save(entity);

        // Generate program_id after save to have the id
        String programId = generateProgramId(saved.getId());
        saved.setProgramId(programId);
        saved = repository.save(saved);

        return ProgramMapper.toResponseDto(saved);
    }

    /**
     * Generate program_id in format: PID{serial}
     * Example: PID1, PID2, PID100
     */
    private String generateProgramId(Long id) {
        return "PID" + id;
    }

    @Override
    public PageResponse<ProgramResponseDto> listPrograms(
            String q,
            Integer page,
            Integer size,
            String sort,
            Long sessionPartId,
            Long statusId,
            List<Long> sessionPartIds,
            List<Long> statusIds) {
        // Parse sort parameter
        Pageable pageable = buildPageable(page, size, sort);

        // Normalize empty lists to null for JPQL query (empty lists cause issues with IN clause)
        List<Long> normalizedSessionPartIds = (sessionPartIds != null && sessionPartIds.isEmpty()) ? null : sessionPartIds;
        List<Long> normalizedStatusIds = (statusIds != null && statusIds.isEmpty()) ? null : statusIds;

        // Search with filters
        Page<ProgramEntity> pageResult = repository.search(
                q, sessionPartId, statusId, normalizedSessionPartIds, normalizedStatusIds, pageable);

        return buildPageResponse(pageResult);
    }

    @Override
    public ProgramResponseDto getProgramById(Long id) {
        ProgramEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));
        return ProgramMapper.toResponseDto(entity);
    }

    @Override
    @Transactional
    public ProgramResponseDto updateProgram(Long id, ProgramUpdateDto request) {
        ProgramEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));

        // Validate foreign key references if provided
        validateMasterCodeExists(request.getSessionPartId(), "Session/Part");
        validateMasterCodeExists(request.getStatusId(), "Status");
        if (request.getProgramTypeId() != null) {
            validateMasterCodeExists(request.getProgramTypeId(), "Program Type");
        }

        // Update entity
        ProgramMapper.updateEntityFromDto(entity, request);
        entity.setUpdatedAt(LocalDateTime.now());

        ProgramEntity updated = repository.save(entity);
        return ProgramMapper.toResponseDto(updated);
    }

    @Override
    @Transactional
    public void deleteProgram(Long id) {
        ProgramEntity entity = repository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));

        // Soft delete
        entity.setIsDelete(true);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
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

    private PageResponse<ProgramResponseDto> buildPageResponse(Page<ProgramEntity> pageResult) {
        return PageResponse.<ProgramResponseDto>builder()
                .items(ProgramMapper.toResponseDtoList(pageResult.getContent()))
                .total(pageResult.getTotalElements())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public void exportProgramsToExcel(
            OutputStream outputStream,
            String q,
            List<Long> statusIds) throws IOException {
        
        // Normalize empty lists to null for JPQL query
        List<Long> normalizedStatusIds = (statusIds != null && statusIds.isEmpty()) ? null : statusIds;

        // Use SXSSFWorkbook for streaming Excel export (memory-efficient)
        // Window size of 100: keeps only last 100 rows in memory, flushes older rows to temp files
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            // Compress temp files to reduce disk space usage
            workbook.setCompressTempFiles(true);

            Sheet sheet = workbook.createSheet("Programs");

            // Create header row
            Row headerRow = sheet.createRow(0);
            int colNum = 0;
            headerRow.createCell(colNum++).setCellValue("Program ID");
            headerRow.createCell(colNum++).setCellValue("Program Name");
            headerRow.createCell(colNum++).setCellValue("Session/Part");
            headerRow.createCell(colNum++).setCellValue("Program Type");
            headerRow.createCell(colNum++).setCellValue("Status");
            headerRow.createCell(colNum++).setCellValue("Notes");
            headerRow.createCell(colNum++).setCellValue("Registration Date");

            // Date formatter
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MM.dd.yyyy");

            // Stream data from database and write rows
            AtomicInteger rowNum = new AtomicInteger(1);
            try (Stream<ProgramEntity> programStream = repository.streamForExport(q, normalizedStatusIds)) {
                
                programStream.forEach(program -> {
                    Row row = sheet.createRow(rowNum.getAndIncrement());
                    int cellNum = 0;
                    
                    // Program ID
                    row.createCell(cellNum++).setCellValue(program.getProgramId() != null ? program.getProgramId() : "");
                    // Program Name
                    row.createCell(cellNum++).setCellValue(program.getName() != null ? program.getName() : "");
                    // Session/Part
                    row.createCell(cellNum++).setCellValue(program.getSessionPart() != null && program.getSessionPart().getCodeName() != null ? program.getSessionPart().getCodeName() : "");
                    // Program Type
                    row.createCell(cellNum++).setCellValue(program.getProgramType() != null && program.getProgramType().getCodeName() != null ? program.getProgramType().getCodeName() : "");
                    // Status
                    row.createCell(cellNum++).setCellValue(program.getStatus() != null && program.getStatus().getCodeName() != null ? program.getStatus().getCodeName() : "");
                    // Notes
                    row.createCell(cellNum++).setCellValue(program.getNotes() != null ? program.getNotes() : "");
                    // Registration Date (createdAt)
                    row.createCell(cellNum++).setCellValue(program.getCreatedAt() != null ? program.getCreatedAt().format(dateFormatter) : "");
                });
            }

            // Write workbook to output stream
            workbook.write(outputStream);
            outputStream.flush();
            
            // Dispose to clean up temporary files created by SXSSFWorkbook
            workbook.dispose();
        }
    }
}
