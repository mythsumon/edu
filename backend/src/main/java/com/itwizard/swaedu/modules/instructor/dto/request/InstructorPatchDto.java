package com.itwizard.swaedu.modules.instructor.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorPatchDto {

    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;

    @Email(message = "Email must be valid")
    private String email;

    private String phone;

    private String gender;

    private LocalDate dob;

    private Long regionId;

    private String city;

    private String street;

    private String detailAddress;

    private Long statusId;

    private Long classificationId;
}
