package com.abode.tenancy.dto;

import com.abode.tenancy.domain.enums.ComplaintCategory;
import com.abode.tenancy.domain.enums.ComplaintPriority;
import com.abode.tenancy.domain.enums.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

public class ComplaintDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Category is required")
        private ComplaintCategory category;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        private String photoUrl;
        private ComplaintPriority priority = ComplaintPriority.MEDIUM;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private UUID id;
        private UUID propertyId;
        private UUID tenantId;
        private String tenantName;
        private String tenantPhone;
        private UUID roomId;
        private String roomNumber;
        private ComplaintCategory category;
        private String title;
        private String description;
        private String photoUrl;
        private ComplaintPriority priority;
        private ComplaintStatus status;
        private String assignedTo;
        private String resolutionNotes;
        private ZonedDateTime resolvedAt;
        private ZonedDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private ComplaintStatus status;

        private String assignedTo;
        private String resolutionNotes;
    }
}
