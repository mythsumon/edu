package com.itwizard.swaedu.modules.training.controller;

import com.itwizard.swaedu.modules.training.dto.request.TrainingCreateDto;
import com.itwizard.swaedu.modules.training.dto.request.TrainingUpdateDto;
import com.itwizard.swaedu.modules.training.dto.response.TrainingResponseDto;
import com.itwizard.swaedu.modules.training.service.TrainingService;
import com.itwizard.swaedu.util.ApiResponse;
import com.itwizard.swaedu.util.PageResponse;
import com.itwizard.swaedu.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trainings")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    // POST /api/v1/trainings — create training
    @PostMapping
    public ResponseEntity<ApiResponse> createTraining(@Valid @RequestBody TrainingCreateDto request) {
        TrainingResponseDto response = trainingService.createTraining(request);
        return ResponseUtil.created("Training created successfully", response);
    }

    // GET /api/v1/trainings — list trainings (pagination + search + filters)
    // If page and size are not provided, returns all records
    @GetMapping
    public ResponseEntity<ApiResponse> listTrainings(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) List<Long> programIds,
            @RequestParam(required = false) List<Long> institutionIds,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateTo) {
        PageResponse<TrainingResponseDto> response = trainingService.listTrainings(
                q, page, size, sort, programId, institutionId, programIds, institutionIds,
                startDateFrom, startDateTo, endDateFrom, endDateTo);
        return ResponseUtil.success("Trainings retrieved successfully", response);
    }

    // GET /api/v1/trainings/{id} — training detail
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getTrainingById(@PathVariable Long id) {
        TrainingResponseDto response = trainingService.getTrainingById(id);
        return ResponseUtil.success("Training retrieved successfully", response);
    }

    // PUT /api/v1/trainings/{id} — update training (full update)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateTraining(
            @PathVariable Long id,
            @Valid @RequestBody TrainingUpdateDto request) {
        TrainingResponseDto response = trainingService.updateTraining(id, request);
        return ResponseUtil.success("Training updated successfully", response);
    }

    // DELETE /api/v1/trainings/{id} — delete training (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTraining(@PathVariable Long id) {
        trainingService.deleteTraining(id);
        return ResponseUtil.success("Training deleted successfully");
    }

    // GET /api/v1/trainings/template/download — download class template CSV file
    @GetMapping("/template/classes/download")
    public ResponseEntity<Resource> downloadTemplate() {
        Resource resource = new ClassPathResource("template/class_template.csv");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("class_template.csv")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }
}
