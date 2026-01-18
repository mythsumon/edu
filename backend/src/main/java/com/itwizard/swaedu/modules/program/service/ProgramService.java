package com.itwizard.swaedu.modules.program.service;

import com.itwizard.swaedu.modules.program.dto.request.ProgramCreateDto;
import com.itwizard.swaedu.modules.program.dto.request.ProgramUpdateDto;
import com.itwizard.swaedu.modules.program.dto.response.ProgramResponseDto;
import com.itwizard.swaedu.util.PageResponse;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

public interface ProgramService {
    ProgramResponseDto createProgram(ProgramCreateDto request);

    PageResponse<ProgramResponseDto> listPrograms(
            String q,
            Integer page,
            Integer size,
            String sort,
            Long sessionPartId,
            Long statusId,
            List<Long> sessionPartIds,
            List<Long> statusIds);

    ProgramResponseDto getProgramById(Long id);

    ProgramResponseDto updateProgram(Long id, ProgramUpdateDto request);

    void deleteProgram(Long id);

    void exportProgramsToExcel(
            OutputStream outputStream,
            String q,
            List<Long> statusIds) throws IOException;
}
