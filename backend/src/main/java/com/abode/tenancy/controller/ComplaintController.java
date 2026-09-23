package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.common.CurrentUser;
import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.domain.model.Complaint;
import com.abode.tenancy.dto.ComplaintDto;
import com.abode.tenancy.service.ComplaintService;
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
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@Tag(name = "09. Complaints & Maintenance Issues", description = "Tenant Issue Raising, Resolution Lifecycle, and Action Tracking")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/tenant/{tenantId}")
    @PreAuthorize("@securityValidationService.isTenantOrAdmin(#tenantId, authentication)")
    @Operation(summary = "Raise a new complaint / issue")
    public ResponseEntity<ApiResponse<Complaint>> raiseComplaint(
            @PathVariable UUID tenantId,
            @Valid @RequestBody ComplaintDto.CreateRequest request) {
        Complaint complaint = complaintService.raiseComplaint(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint registered successfully", complaint));
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get all complaints for a property")
    public ResponseEntity<ApiResponse<List<ComplaintDto.Summary>>> getPropertyComplaints(@PathVariable UUID propertyId) {
        List<ComplaintDto.Summary> complaints = complaintService.getComplaintsForProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("@securityValidationService.isTenantOrAdmin(#tenantId, authentication)")
    @Operation(summary = "Get all complaints raised by a tenant")
    public ResponseEntity<ApiResponse<List<ComplaintDto.Summary>>> getTenantComplaints(@PathVariable UUID tenantId) {
        List<ComplaintDto.Summary> complaints = complaintService.getComplaintsForTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @PutMapping("/{complaintId}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Update complaint status (NEW -> ACKNOWLEDGED -> IN_PROGRESS -> RESOLVED -> CLOSED)")
    public ResponseEntity<ApiResponse<Complaint>> updateStatus(
            @PathVariable UUID complaintId,
            @Valid @RequestBody ComplaintDto.UpdateStatusRequest request,
            @CurrentUser UserPrincipal principal) {
        Complaint complaint = complaintService.updateComplaintStatus(complaintId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated to " + request.getStatus(), complaint));
    }
}

