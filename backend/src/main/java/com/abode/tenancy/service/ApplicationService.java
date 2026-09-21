package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.ApplicationStatus;
import com.abode.tenancy.domain.model.Property;
import com.abode.tenancy.domain.model.TenantApplication;
import com.abode.tenancy.domain.repository.PropertyRepository;
import com.abode.tenancy.domain.repository.TenantApplicationRepository;
import com.abode.tenancy.dto.ApplicationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final TenantApplicationRepository applicationRepository;
    private final PropertyRepository propertyRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public TenantApplication submitApplication(ApplicationDto.CreateRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        TenantApplication app = TenantApplication.builder()
                .property(property)
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .age(request.getAge())
                .occupation(request.getOccupation())
                .companyOrCollege(request.getCompanyOrCollege())
                .preferredSharing(request.getPreferredSharing())
                .expectedJoiningDate(request.getExpectedJoiningDate())
                .status(ApplicationStatus.PENDING)
                .notes(request.getNotes())
                .build();

        app = applicationRepository.save(app);

        // Notify property owner
        notificationService.sendNotification(
                property.getOwner().getId(),
                property.getId(),
                "SYSTEM",
                "New Tenant Request: " + app.getName(),
                app.getName() + " requested " + app.getPreferredSharing() + "-sharing room. Expected joining: " + app.getExpectedJoiningDate(),
                "/owner/applications"
        );

        auditService.log(property.getId(), null, "SUBMIT_APPLICATION", "TenantApplication", app.getId().toString(),
                "New application from " + app.getName());

        return app;
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto.Summary> getApplications(UUID propertyId, ApplicationStatus status) {
        List<TenantApplication> apps;
        if (status != null) {
            apps = applicationRepository.findByPropertyIdAndStatusOrderByCreatedAtDesc(propertyId, status);
        } else {
            apps = applicationRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId);
        }

        return apps.stream().map(a -> ApplicationDto.Summary.builder()
                .id(a.getId())
                .propertyId(a.getProperty().getId())
                .propertyName(a.getProperty().getName())
                .name(a.getName())
                .phone(a.getPhone())
                .email(a.getEmail())
                .age(a.getAge())
                .occupation(a.getOccupation())
                .companyOrCollege(a.getCompanyOrCollege())
                .preferredSharing(a.getPreferredSharing())
                .expectedJoiningDate(a.getExpectedJoiningDate())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public void updateStatus(UUID applicationId, ApplicationDto.UpdateStatusRequest request) {
        TenantApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        app.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            app.setNotes(request.getNotes());
        }
        applicationRepository.save(app);

        auditService.log(app.getProperty().getId(), null, "UPDATE_STATUS", "TenantApplication", app.getId().toString(),
                "Application status updated to " + request.getStatus());
    }
}

