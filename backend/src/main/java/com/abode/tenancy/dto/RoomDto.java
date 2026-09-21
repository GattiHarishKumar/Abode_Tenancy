package com.abode.tenancy.dto;

import com.abode.tenancy.domain.enums.BedStatus;
import com.abode.tenancy.domain.enums.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class RoomDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private UUID id;
        private String roomNumber;
        private Integer floorNumber;
        private Integer sharingType;
        private BigDecimal baseRent;
        private Boolean isAc;
        private Boolean hasBalcony;
        private Boolean hasAttachedWashroom;
        private Boolean isCleanedToday;
        private String lastCleanedAt;
        private RoomStatus status;
        private int totalBeds;
        private int occupiedBeds;
        private int availableBeds;
        private List<BedItem> beds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BedItem {
        private UUID id;
        private String bedLabel;
        private BedStatus status;
        private UUID currentTenantId;
        private String currentTenantName;
        private String currentTenantPhone;
        private Boolean isOnNotice;
        private String vacatingDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Room number is required")
        private String roomNumber;

        private Integer floorNumber = 1;

        @NotNull(message = "Sharing type is required")
        private Integer sharingType;

        @NotNull(message = "Base rent is required")
        private BigDecimal baseRent;

        private Boolean isAc = false;
        private Boolean hasBalcony = false;
        private Boolean hasAttachedWashroom = true;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomDetail {
        private UUID id;
        private String roomNumber;
        private Integer floorNumber;
        private Integer sharingType;
        private BigDecimal baseRent;
        private Boolean isAc;
        private Boolean hasBalcony;
        private Boolean hasAttachedWashroom;
        private Boolean isCleanedToday;
        private String lastCleanedAt;
        private RoomStatus status;
        private List<BedDetail> beds;
        private List<RoomComplaint> openComplaints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BedDetail {
        private UUID bedId;
        private String bedLabel;
        private BedStatus status;
        private UUID tenantId;
        private String tenantName;
        private String tenantPhone;
        private String joiningDate;
        private String rentStatus; // PAID, PENDING, OVERDUE
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomComplaint {
        private UUID id;
        private String title;
        private String category;
        private String status;
        private String createdAt;
    }
}

