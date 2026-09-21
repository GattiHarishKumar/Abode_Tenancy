package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.common.CurrentUser;
import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.domain.model.Property;
import com.abode.tenancy.dto.PropertyDto;
import com.abode.tenancy.service.PropertyService;
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
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
@Tag(name = "02. Property Management", description = "PG Properties, Buildings, Facilities, Rules, and Configurations")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get list of properties owned by current user")
    public ResponseEntity<ApiResponse<List<PropertyDto.Summary>>> getOwnerProperties(@CurrentUser UserPrincipal principal) {
        List<PropertyDto.Summary> properties = propertyService.getOwnerProperties(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get detailed summary of a specific property")
    public ResponseEntity<ApiResponse<PropertyDto.Summary>> getPropertySummary(@PathVariable UUID id) {
        PropertyDto.Summary summary = propertyService.getPropertySummary(id);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new PG / Hostel property")
    public ResponseEntity<ApiResponse<Property>> createProperty(@CurrentUser UserPrincipal principal,
                                                                @Valid @RequestBody PropertyDto.CreateRequest request) {
        Property property = propertyService.createProperty(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Property created successfully", property));
    }
}
