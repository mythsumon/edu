package com.itwizard.swaedu.modules.instructor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorProfileDto {
    private String name;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dob;
    private Long regionId;
    private Long cityId;
    private String street;
    private String detailAddress;
    private Long statusId;
    private Long classificationId;
    private String affiliation;
    private String signature;
    private String profilePhoto;
}
