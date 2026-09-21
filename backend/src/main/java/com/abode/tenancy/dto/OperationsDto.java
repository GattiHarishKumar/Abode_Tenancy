package com.abode.tenancy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class OperationsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerDashboard {
        private UUID propertyId;
        private String propertyName;
        private String city;
        private String date;

        // KPI Counters
        private long totalTenants;
        private long totalBeds;
        private long occupiedBeds;
        private long availableBeds;
        private double occupancyRate;
        private BigDecimal pendingRent;
        private long pendingRentCount;
        private long openComplaintsCount;
        private long pendingApplicationsCount;
        private long vacatingSoonCount;

        // Today's Meals Counter
        private MealCounter breakfast;
        private MealCounter lunch;
        private MealCounter dinner;

        // Action Center & Today's Operations
        private List<ActionItem> actionCenter;
        private TodayOperations operations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealCounter {
        private long confirmed;
        private long expected;
        private long notConfirmed;
        private String prepStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionItem {
        private String id;
        private String level; // CRITICAL (red), WARNING (orange), INFO (yellow), SUCCESS (green)
        private String title;
        private String description;
        private String link;
        private String count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodayOperations {
        private String propertyStatus;
        private String rentStatus;
        private String breakfastStatus;
        private String lunchStatus;
        private String dinnerStatus;
        private String issuesStatus;
        private String newTenantsStatus;
        private String vacatingStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TenantDayView {
        private String tenantName;
        private String propertyName;
        private String roomNumber;
        private String bedLabel;
        private String todayDate;

        // Meals for today
        private List<TenantMealCard> todayMeals;

        // Status alerts
        private String rentStatus;
        private String rentDueDate;
        private BigDecimal rentDueAmount;
        private List<ComplaintDto.Summary> activeComplaints;
        private List<AnnouncementDto.Summary> recentAnnouncements;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TenantMealCard {
        private String mealType;
        private String title;
        private String timing;
        private String items;
        private Boolean isAttending;
        private Boolean isCutoffPassed;
    }
}

