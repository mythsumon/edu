package com.itwizard.swaedu.modules.institutions.service;

import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionCreateDto;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionUpdateDto;
import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.util.PageResponse;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

public interface InstitutionService {
    InstitutionResponseDto createInstitution(InstitutionCreateDto request);

    PageResponse<InstitutionResponseDto> listInstitutions(
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
            Long teacherId);

    InstitutionResponseDto getInstitutionById(Long id);

    InstitutionResponseDto updateInstitution(Long id, InstitutionUpdateDto request);

    void deleteInstitution(Long id);

    void exportInstitutionsToExcel(
            OutputStream outputStream,
            String q,
            List<Long> majorCategoryIds,
            List<Long> categoryOneIds,
            List<Long> categoryTwoIds,
            List<Long> classificationIds,
            Long districtId,
            List<Long> zoneIds,
            List<Long> regionIds,
            Long teacherId) throws IOException;
}
