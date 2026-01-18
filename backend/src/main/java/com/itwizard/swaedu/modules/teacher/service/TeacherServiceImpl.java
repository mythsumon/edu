package com.itwizard.swaedu.modules.teacher.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.modules.teacher.dto.response.TeacherResponseDto;
import com.itwizard.swaedu.modules.teacher.mapper.TeacherMapper;
import com.itwizard.swaedu.modules.teacher.repository.TeacherRepository;
import com.itwizard.swaedu.modules.teacher.entity.Teacher;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;

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
