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
import com.itwizard.swaedu.modules.region.entity.RegionEntity;
import com.itwizard.swaedu.modules.region.repository.RegionRepository;
import com.itwizard.swaedu.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstructorServiceImpl implements InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RegionRepository regionRepository;
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

        // Set region if provided
        if (request.getRegionId() != null) {
            RegionEntity region = regionRepository.findById(request.getRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region not found with id: " + request.getRegionId()));
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
    public PageResponse<InstructorResponseDto> listInstructors(String q, Integer page, Integer size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<Instructor> pageResult = instructorRepository.search(q, pageable);
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
            RegionEntity region = regionRepository.findById(request.getRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region not found with id: " + request.getRegionId()));
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
            RegionEntity region = regionRepository.findById(request.getRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region not found with id: " + request.getRegionId()));
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
