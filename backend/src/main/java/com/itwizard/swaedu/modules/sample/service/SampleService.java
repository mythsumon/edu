package com.itwizard.swaedu.modules.sample.service;

import com.itwizard.swaedu.modules.sample.dto.request.SampleRequestDto;
import com.itwizard.swaedu.modules.sample.dto.response.SampleResponseDto;

import java.util.List;

public interface SampleService {
    SampleResponseDto createSample(SampleRequestDto sampleRequestDto);
    
    SampleResponseDto getSampleById(Long id);
    
    List<SampleResponseDto> getAllSamples();
    
    SampleResponseDto updateSample(Long id, SampleRequestDto sampleRequestDto);
    
    void deleteSample(Long id);
}

