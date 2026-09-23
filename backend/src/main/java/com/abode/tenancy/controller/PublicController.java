package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.domain.model.TenantApplication;
import com.abode.tenancy.dto.ApplicationDto;
import com.abode.tenancy.dto.PropertyDto;
import com.abode.tenancy.service.ApplicationService;
import com.abode.tenancy.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "03. Public PG Profile & Onboarding", description = "Public QR Landing Page, Vacancies, Facilities, Pricing, and Join Requests")
public class PublicController {

    private final PropertyService propertyService;
    private final ApplicationService applicationService;

    @GetMapping("/properties/{slug}")
    @Operation(summary = "Get public PG profile by slug (for QR code scan / mini website)")
    public ResponseEntity<ApiResponse<PropertyDto.PublicProfile>> getPublicProfile(@PathVariable String slug) {
        PropertyDto.PublicProfile profile = propertyService.getPublicProfile(slug);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping("/applications")
    @Operation(summary = "Submit a prospective tenant join request")
    public ResponseEntity<ApiResponse<String>> submitApplication(@Valid @RequestBody ApplicationDto.CreateRequest request) {
        TenantApplication app = applicationService.submitApplication(request);
        return ResponseEntity.ok(ApiResponse.success("Join request submitted successfully. Application ID: " + app.getId()));
    }
}

