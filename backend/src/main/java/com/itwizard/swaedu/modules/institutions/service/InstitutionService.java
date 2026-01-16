package com.itwizard.swaedu.modules.institutions.service;

import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionCreateDto;
import com.itwizard.swaedu.modules.institutions.dto.request.InstitutionUpdateDto;
import com.itwizard.swaedu.modules.institutions.dto.response.InstitutionResponseDto;
import com.itwizard.swaedu.util.PageResponse;

public interface InstitutionService {
    InstitutionResponseDto createInstitution(InstitutionCreateDto request);

    PageResponse<InstitutionResponseDto> listInstitutions(
            String q,
            Integer page,
            Integer size,
            String sort,
            Long institutionTypeId,
            Long regionId,
            Long educationTypeId,
            Long inChargePersonId);

    InstitutionResponseDto getInstitutionById(Long id);

    InstitutionResponseDto updateInstitution(Long id, InstitutionUpdateDto request);

    void deleteInstitution(Long id);
}
