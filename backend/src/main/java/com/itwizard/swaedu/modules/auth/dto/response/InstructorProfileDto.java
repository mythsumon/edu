package com.itwizard.swaedu.modules.auth.dto.response;

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
    private String city;
    private String street;
    private String detailAddress;
}
