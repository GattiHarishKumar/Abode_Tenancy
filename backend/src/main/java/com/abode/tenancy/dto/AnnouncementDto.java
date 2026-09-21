package com.abode.tenancy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

public class AnnouncementDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Property ID is required")
        private UUID propertyId;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Message is required")
        private String message;

        private String targetAudience = "ALL";
        private Integer targetFloor;
        private UUID targetRoomId;
        private Boolean isPinned = false;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private UUID id;
        private UUID propertyId;
        private String title;
        private String message;
        private String targetAudience;
        private Integer targetFloor;
        private UUID targetRoomId;
        private Boolean isPinned;
        private ZonedDateTime createdAt;
    }
}
