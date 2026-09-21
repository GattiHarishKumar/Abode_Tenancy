package com.abode.tenancy.dto;

import com.abode.tenancy.domain.enums.MealPrepState;
import com.abode.tenancy.domain.enums.MealType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class FoodDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuResponse {
        private UUID id;
        private UUID propertyId;
        private LocalDate menuDate;
        private String breakfastItems;
        private String breakfastStart;
        private String breakfastEnd;
        private String lunchItems;
        private String lunchStart;
        private String lunchEnd;
        private String dinnerItems;
        private String dinnerStart;
        private String dinnerEnd;
        private Boolean isPublished;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveMenuRequest {
        @NotNull(message = "Menu date is required")
        private LocalDate menuDate;

        private String breakfastItems;
        private String breakfastStart = "08:00";
        private String breakfastEnd = "10:00";

        private String lunchItems;
        private String lunchStart = "12:30";
        private String lunchEnd = "14:30";

        private String dinnerItems;
        private String dinnerStart = "19:30";
        private String dinnerEnd = "21:30";

        private Boolean isPublished = true;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealConfirmationItem {
        private MealType mealType;
        private Boolean isAttending;
        private Boolean isCutoffPassed;
        private String timing;
        private String items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealConfirmRequest {
        @NotNull(message = "Date is required")
        private LocalDate date;

        @NotNull(message = "Meal type is required")
        private MealType mealType;

        @NotNull(message = "Attendance status is required")
        private Boolean isAttending;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CookDashboard {
        private LocalDate date;
        private UUID propertyId;
        private String propertyName;
        private String cookLanguage;
        private List<CookMealCard> meals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CookMealCard {
        private MealType mealType;
        private String title;
        private String timing;
        private String items;
        private long confirmedCount;
        private long expectedCount;
        private MealPrepState status;
        private Integer preparedCount;
        private List<IngredientEstimate> ingredients;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngredientEstimate {
        private String name;
        private String quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePrepStatusRequest {
        @NotNull(message = "Status is required")
        private MealPrepState status;
        private Integer preparedCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WasteEntryRequest {
        @NotNull(message = "Meal type is required")
        private MealType mealType;

        @NotNull(message = "Leftover quantity in kg is required")
        private BigDecimal leftoverKg;

        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitRatingRequest {
        @NotNull(message = "Meal type is required")
        private MealType mealType;

        @NotNull(message = "Rating is required (1-5)")
        private Integer rating;

        private Integer tasteRating;
        private Integer qualityRating;
        private Integer quantityRating;
        private String comments;
    }
}

