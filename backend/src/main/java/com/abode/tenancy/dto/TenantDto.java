package com.abode.tenancy.dto;

import com.abode.tenancy.domain.enums.TenantStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class TenantDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private UUID id;
        private UUID userId;
        private String fullName;
        private String phone;
        private String email;
        private UUID roomId;
        private String roomNumber;
        private UUID bedId;
        private String bedLabel;
        private Integer sharingType;
        private LocalDate joiningDate;
        private BigDecimal rentAmount;
        private BigDecimal depositAmount;
        private TenantStatus status;
        private String currentMonthRentStatus; // PAID, PENDING, OVERDUE
        private int openComplaintsCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OnboardRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Phone is required")
        private String phone;

        private String email;

        @NotNull(message = "Room ID is required")
        private UUID roomId;

        @NotNull(message = "Bed ID is required")
        private UUID bedId;

        @NotNull(message = "Joining date is required")
        private LocalDate joiningDate;

        @NotNull(message = "Rent amount is required")
        private BigDecimal rentAmount;

        private BigDecimal depositAmount = BigDecimal.ZERO;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private UUID applicationId; // optional link if onboarding from application
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferRequest {
        @NotNull(message = "New Room ID is required")
        private UUID newRoomId;

        @NotNull(message = "New Bed ID is required")
        private UUID newBedId;

        private BigDecimal newRentAmount;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Profile360 {
        private UUID id;
        private UUID userId;
        private String fullName;
        private String phone;
        private String email;
        private String avatarUrl;
        private UUID propertyId;
        private String propertyName;
        private UUID roomId;
        private String roomNumber;
        private UUID bedId;
        private String bedLabel;
        private Integer sharingType;
        private LocalDate joiningDate;
        private LocalDate vacatingDate;
        private BigDecimal rentAmount;
        private BigDecimal depositAmount;
        private BigDecimal totalOutstandingBalance;
        private String upiId;
        private TenantStatus status;
        private String emergencyContactName;
        private String emergencyContactPhone;

        // Sub-tabs summary
        private List<RentDto.InvoiceItem> recentInvoices;
        private List<ComplaintDto.Summary> complaints;
        private List<TimelineEvent> activityTimeline;
        private int verifiedDocumentsCount;
        private int totalDocumentsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEvent {
        private String date;
        private String title;
        private String category;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SettlementRequest {
        private BigDecimal depositHeld;
        private BigDecimal paintingCleaningDeduction = new BigDecimal("2000.00");
        private BigDecimal unpaidDues = BigDecimal.ZERO;
        private BigDecimal damageDeductions = BigDecimal.ZERO;
        private String deductionNotes;
        private LocalDate vacatingDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SettlementResponse {
        private UUID tenantId;
        private String tenantName;
        private BigDecimal depositHeld;
        private BigDecimal totalDeductions;
        private BigDecimal netRefundAmount;
        private BigDecimal shortfallAmount;
        private String settlementDate;
        private String status;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NoticePeriodItem {
        private UUID tenantId;
        private String tenantName;
        private String tenantPhone;
        private UUID roomId;
        private String roomNumber;
        private UUID bedId;
        private String bedLabel;
        private String vacatingDate;
        private long daysRemaining;
        private BigDecimal depositHeld;
        private BigDecimal rentAmount;
    }
}

