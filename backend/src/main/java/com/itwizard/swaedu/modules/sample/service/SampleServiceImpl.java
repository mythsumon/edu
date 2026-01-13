package com.itwizard.swaedu.modules.sample.service;

import com.itwizard.swaedu.exception.ResourceNotFoundException;
import com.itwizard.swaedu.modules.sample.mapper.SampleMapper;
import com.itwizard.swaedu.modules.sample.dto.request.SampleRequestDto;
import com.itwizard.swaedu.modules.sample.dto.response.SampleResponseDto;
import com.itwizard.swaedu.modules.sample.entity.SampleEntity;
import com.itwizard.swaedu.modules.sample.repository.SampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SampleServiceImpl implements SampleService {

    private final SampleRepository sampleRepository;

    @Override
    public SampleResponseDto createSample(SampleRequestDto sampleRequestDto) {
        SampleEntity sampleData = SampleMapper.toEntity(sampleRequestDto);
        SampleEntity resData = sampleRepository.save(sampleData);
        return SampleMapper.toResponseDto(resData);
    }

    @Override
    public SampleResponseDto getSampleById(Long id) {
        SampleEntity entity = sampleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with id: " + id));
        return SampleMapper.toResponseDto(entity);
    }

    @Override
    public List<SampleResponseDto> getAllSamples() {
        List<SampleEntity> entities = sampleRepository.findAll();
        return entities.stream()
                .map(SampleMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public SampleResponseDto updateSample(Long id, SampleRequestDto sampleRequestDto) {
        SampleEntity entity = sampleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with id: " + id));
        SampleMapper.updateEntityFromRequest(entity, sampleRequestDto);
        SampleEntity updatedEntity = sampleRepository.save(entity);
        return SampleMapper.toResponseDto(updatedEntity);
    }

    @Override
    public void deleteSample(Long id) {
        SampleEntity entity = sampleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found with id: " + id));
        sampleRepository.delete(entity);
    }
}

