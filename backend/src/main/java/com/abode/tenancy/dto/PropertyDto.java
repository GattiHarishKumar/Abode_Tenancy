package com.abode.tenancy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PropertyDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private UUID id;
        private String name;
        private String slug;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String genderAllowed;
        private String contactPhone;
        private String contactEmail;
        private Integer totalRooms;
        private Long totalBeds;
        private Long occupiedBeds;
        private Long availableBeds;
        private Double occupancyRate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Property name is required")
        private String name;

        @NotBlank(message = "Slug is required")
        private String slug;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "Pincode is required")
        private String pincode;

        private String genderAllowed = "CO_ED";

        @NotBlank(message = "Contact phone is required")
        private String contactPhone;

        private String contactEmail;
        private String description;
        private String rules;
        private Integer noticePeriodDays = 30;
        private BigDecimal defaultDeposit = new BigDecimal("10000.00");
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicProfile {
        private UUID id;
        private String name;
        private String slug;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String genderAllowed;
        private String contactPhone;
        private String contactEmail;
        private String description;
        private String rules;
        private Integer noticePeriodDays;
        private BigDecimal defaultDeposit;
        private BigDecimal referralReward;
        private List<PhotoItem> photos;
        private List<FacilityItem> facilities;
        private List<PricingItem> pricing;
        private List<FaqItem> faqs;
        private List<VacancyItem> vacancies;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhotoItem {
        private UUID id;
        private String category;
        private String photoUrl;
        private String caption;
        private Integer sortOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityItem {
        private UUID id;
        private String facilityName;
        private String icon;
        private Boolean isAvailable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingItem {
        private UUID id;
        private Integer sharingType;
        private BigDecimal monthlyRent;
        private BigDecimal depositAmount;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FaqItem {
        private UUID id;
        private String question;
        private String answer;
        private Integer sortOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VacancyItem {
        private Integer sharingType;
        private long totalBeds;
        private long availableBeds;
        private String status; // FULL, AVAILABLE
    }
}

