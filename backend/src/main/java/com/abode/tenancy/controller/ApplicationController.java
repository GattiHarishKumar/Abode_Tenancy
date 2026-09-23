package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.domain.enums.ApplicationStatus;
import com.abode.tenancy.dto.ApplicationDto;
import com.abode.tenancy.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "06. Tenant Applications", description = "Review and Decision Workflow for Inbound Tenant Requests")
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get list of applications for property")
    public ResponseEntity<ApiResponse<List<ApplicationDto.Summary>>> getApplications(
            @PathVariable UUID propertyId,
            @RequestParam(required = false) ApplicationStatus status) {
        List<ApplicationDto.Summary> apps = applicationService.getApplications(propertyId, status);
        return ResponseEntity.ok(ApiResponse.success(apps));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Approve or Reject tenant application")
    public ResponseEntity<ApiResponse<String>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationDto.UpdateStatusRequest request) {
        applicationService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Application status updated to " + request.getStatus()));
    }
}

