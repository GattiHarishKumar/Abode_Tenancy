package com.abode.tenancy.dto;

import com.abode.tenancy.domain.enums.VacateStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public class VacatingDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Notice days is required (15 or 30)")
        private Integer noticeDays;

        private String exitNotes;
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
        private String roomNumber;
        private String bedLabel;
        private Integer noticeDays;
        private LocalDate submitDate;
        private LocalDate expectedVacateDate;
        private VacateStatus status;
        private String exitNotes;
        private Boolean roomInspected;
        private Boolean keyReturned;
        private Boolean pendingDuesCleared;
        private Boolean depositRefunded;
        private BigDecimal refundAmount;
        private ZonedDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotNull(message = "Status is required")
        private VacateStatus status;

        private Boolean roomInspected;
        private Boolean keyReturned;
        private Boolean pendingDuesCleared;
        private Boolean depositRefunded;
        private BigDecimal refundAmount;
        private String exitNotes;
    }
}

