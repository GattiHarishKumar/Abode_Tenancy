package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.common.CurrentUser;
import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.dto.OperationsDto;
import com.abode.tenancy.service.OperationsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations")
@RequiredArgsConstructor
@Tag(name = "10. Command Center & Daily Operations", description = "Owner Command Dashboard, Action Center, and Tenant Day View")
public class OperationsController {

    private final OperationsService operationsService;

    @GetMapping("/owner-dashboard/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get owner command-center dashboard, live KPIs, Action Center, and Today's Operations")
    public ResponseEntity<ApiResponse<OperationsDto.OwnerDashboard>> getOwnerDashboard(@PathVariable UUID propertyId) {
        OperationsDto.OwnerDashboard dashboard = operationsService.getOwnerDashboard(propertyId);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/tenant-day/{tenantId}")
    @PreAuthorize("hasAnyRole('TENANT', 'OWNER', 'SUPER_ADMIN')")
    @Operation(summary = "Get tenant 'Today' / 'My Day' screen view")
    public ResponseEntity<ApiResponse<OperationsDto.TenantDayView>> getTenantDayView(@PathVariable UUID tenantId) {
        OperationsDto.TenantDayView dayView = operationsService.getTenantDayView(tenantId);
        return ResponseEntity.ok(ApiResponse.success(dayView));
    }
}
