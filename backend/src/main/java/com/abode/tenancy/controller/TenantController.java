package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.common.CurrentUser;
import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.domain.enums.Role;
import com.abode.tenancy.domain.model.Tenant;
import com.abode.tenancy.dto.TenantDto;
import com.abode.tenancy.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "05. Tenant Management & Onboarding", description = "Tenant 360° Profile, Onboarding, Room Transfers, and Activity History")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Search and list tenants for property")
    public ResponseEntity<ApiResponse<List<TenantDto.Summary>>> getTenants(
            @PathVariable UUID propertyId,
            @RequestParam(required = false) String search) {
        List<TenantDto.Summary> tenants = tenantService.getTenants(propertyId, search);
        return ResponseEntity.ok(ApiResponse.success(tenants));
    }

    @GetMapping("/{tenantId}/360")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN', 'TENANT')")
    @Operation(summary = "Get comprehensive 360° profile of a tenant")
    public ResponseEntity<ApiResponse<TenantDto.Profile360>> getTenant360(
            @PathVariable UUID tenantId,
            @CurrentUser UserPrincipal principal) {
        TenantDto.Profile360 profile = tenantService.getTenant360(tenantId);

        // Enforce tenant-level isolation: Tenant can only view their own 360 profile
        if (principal.getRole() == Role.TENANT && !profile.getUserId().equals(principal.getId())) {
            throw new AccessDeniedException("You are only permitted to view your own profile.");
        }

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping("/property/{propertyId}/onboard")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Onboard tenant: allocate room, bed, rent, and create active tenancy")
    public ResponseEntity<ApiResponse<TenantDto.Profile360>> onboardTenant(
            @PathVariable UUID propertyId,
            @Valid @RequestBody TenantDto.OnboardRequest request) {
        Tenant tenant = tenantService.onboardTenant(propertyId, request);
        TenantDto.Profile360 profile = tenantService.getTenant360(tenant.getId());
        return ResponseEntity.ok(ApiResponse.success("Tenant onboarded successfully", profile));
    }

    @PostMapping("/{tenantId}/transfer")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Transfer tenant to a different room/bed")
    public ResponseEntity<ApiResponse<String>> transferRoom(
            @PathVariable UUID tenantId,
            @Valid @RequestBody TenantDto.TransferRequest request) {
        tenantService.transferRoom(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Tenant room transfer completed"));
    }

    @PostMapping("/{tenantId}/vacate")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Mark tenant as vacated and free bed/room")
    public ResponseEntity<ApiResponse<String>> vacateTenant(@PathVariable UUID tenantId) {
        tenantService.vacateTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Tenant marked as vacated"));
    }

    @PostMapping("/{tenantId}/settlement")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Calculate and record security deposit deductions & refund settlement")
    public ResponseEntity<ApiResponse<TenantDto.SettlementResponse>> settleDeposit(
            @PathVariable UUID tenantId,
            @RequestBody TenantDto.SettlementRequest request) {
        TenantDto.SettlementResponse response = tenantService.settleDeposit(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Security deposit settlement completed", response));
    }

    @GetMapping("/property/{propertyId}/notice-period")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get list of tenants currently in 30-day notice period pipeline")
    public ResponseEntity<ApiResponse<List<TenantDto.NoticePeriodItem>>> getNoticePeriodTenants(
            @PathVariable UUID propertyId) {
        List<TenantDto.NoticePeriodItem> items = tenantService.getNoticePeriodTenants(propertyId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
