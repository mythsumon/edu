package com.itwizard.swaedu.modules.sample.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class SampleRequestDto {


    private String name;
}
