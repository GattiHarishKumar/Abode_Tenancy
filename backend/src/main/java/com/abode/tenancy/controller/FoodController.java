package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.common.CurrentUser;
import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.domain.enums.MealType;
import com.abode.tenancy.domain.model.MealConfirmation;
import com.abode.tenancy.domain.model.Menu;
import com.abode.tenancy.dto.FoodDto;
import com.abode.tenancy.service.FoodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/food")
@RequiredArgsConstructor
@Tag(name = "07. Food & Menu Operations", description = "Menus, Meal Confirmations, Cutoffs, Cook Dashboard, and Food Waste Tracking")
public class FoodController {

    private final FoodService foodService;

    @GetMapping("/menu/{propertyId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get menu for date")
    public ResponseEntity<ApiResponse<FoodDto.MenuResponse>> getMenu(
            @PathVariable UUID propertyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        FoodDto.MenuResponse menu = foodService.getMenuForDate(propertyId, date);
        return ResponseEntity.ok(ApiResponse.success(menu));
    }

    @PostMapping("/menu/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'COOK', 'SUPER_ADMIN')")
    @Operation(summary = "Save and post menu")
    public ResponseEntity<ApiResponse<Menu>> saveMenu(
            @PathVariable UUID propertyId,
            @Valid @RequestBody FoodDto.SaveMenuRequest request) {
        Menu menu = foodService.saveMenu(propertyId, request);
        return ResponseEntity.ok(ApiResponse.success("Menu saved and posted successfully", menu));
    }

    @GetMapping("/confirmations/tenant/{tenantId}")
    @PreAuthorize("@securityValidationService.isTenantOrAdmin(#tenantId, authentication)")
    @Operation(summary = "Get tenant meal confirmations for date")
    public ResponseEntity<ApiResponse<List<FoodDto.MealConfirmationItem>>> getTenantConfirmations(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        List<FoodDto.MealConfirmationItem> confirmations = foodService.getTenantConfirmations(tenantId, date);
        return ResponseEntity.ok(ApiResponse.success(confirmations));
    }

    @PostMapping("/confirmations/tenant/{tenantId}")
    @PreAuthorize("@securityValidationService.isTenantOrAdmin(#tenantId, authentication)")
    @Operation(summary = "One-tap meal confirmation / cancellation (subject to cutoff)")
    public ResponseEntity<ApiResponse<MealConfirmation>> confirmMeal(
            @PathVariable UUID tenantId,
            @Valid @RequestBody FoodDto.MealConfirmRequest request) {
        MealConfirmation confirmation = foodService.confirmMeal(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Meal confirmation updated", confirmation));
    }

    @GetMapping("/cook/{propertyId}")
    @PreAuthorize("hasAnyRole('COOK', 'OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Cook simplified big-button dashboard")
    public ResponseEntity<ApiResponse<FoodDto.CookDashboard>> getCookDashboard(
            @PathVariable UUID propertyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "en") String lang) {
        if (date == null) date = LocalDate.now();
        FoodDto.CookDashboard dashboard = foodService.getCookDashboard(propertyId, date, lang);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @PutMapping("/cook/{propertyId}/status/{mealType}")
    @PreAuthorize("hasAnyRole('COOK', 'OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Update cooking preparation status (START / READY / DONE)")
    public ResponseEntity<ApiResponse<String>> updateMealStatus(
            @PathVariable UUID propertyId,
            @PathVariable MealType mealType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody FoodDto.UpdatePrepStatusRequest request,
            @CurrentUser UserPrincipal principal) {
        if (date == null) date = LocalDate.now();
        foodService.updateMealPrepStatus(propertyId, date, mealType, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Preparation status updated to " + request.getStatus()));
    }

    @PostMapping("/cook/{propertyId}/waste")
    @PreAuthorize("hasAnyRole('COOK', 'OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Record actual leftover food waste observation")
    public ResponseEntity<ApiResponse<String>> recordFoodWaste(
            @PathVariable UUID propertyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody FoodDto.WasteEntryRequest request,
            @CurrentUser UserPrincipal principal) {
        if (date == null) date = LocalDate.now();
        foodService.recordFoodWaste(propertyId, date, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Food leftover waste recorded"));
    }

    @PostMapping("/ratings/tenant/{tenantId}")
    @PreAuthorize("@securityValidationService.isTenantOrAdmin(#tenantId, authentication)")
    @Operation(summary = "Submit post-meal tenant rating and feedback")
    public ResponseEntity<ApiResponse<String>> submitFoodRating(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody FoodDto.SubmitRatingRequest request) {
        if (date == null) date = LocalDate.now();
        foodService.submitFoodRating(tenantId, date, request);
        return ResponseEntity.ok(ApiResponse.success("Thank you for your food feedback!"));
    }
}

