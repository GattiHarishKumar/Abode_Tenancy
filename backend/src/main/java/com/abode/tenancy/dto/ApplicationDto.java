package com.abode.tenancy.dto;

import com.abode.tenancy.domain.enums.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public class ApplicationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Property ID is required")
        private UUID propertyId;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Phone is required")
        private String phone;

        private String email;
        private Integer age;
        private String occupation;
        private String companyOrCollege;

        @NotNull(message = "Preferred sharing type is required")
        private Integer preferredSharing;

        @NotNull(message = "Expected joining date is required")
        private LocalDate expectedJoiningDate;

        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private UUID id;
        private UUID propertyId;
        private String propertyName;
        private String name;
        private String phone;
        private String email;
        private Integer age;
        private String occupation;
        private String companyOrCollege;
        private Integer preferredSharing;
        private LocalDate expectedJoiningDate;
        private ApplicationStatus status;
        private String notes;
        private ZonedDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private ApplicationStatus status;
        private String notes;
    }
}

