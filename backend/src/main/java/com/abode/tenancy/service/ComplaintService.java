package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.ComplaintStatus;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.ComplaintRepository;
import com.abode.tenancy.domain.repository.TenantRepository;
import com.abode.tenancy.dto.ComplaintDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final TenantRepository tenantRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public Complaint raiseComplaint(UUID tenantId, ComplaintDto.CreateRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Complaint complaint = Complaint.builder()
                .property(tenant.getProperty())
                .tenant(tenant)
                .room(tenant.getRoom())
                .category(request.getCategory())
                .title(request.getTitle())
                .description(request.getDescription())
                .photoUrl(request.getPhotoUrl())
                .priority(request.getPriority())
                .status(ComplaintStatus.NEW)
                .build();

        complaint = complaintRepository.save(complaint);

        // Notify property owner
        notificationService.sendNotification(
                tenant.getProperty().getOwner().getId(),
                tenant.getProperty().getId(),
                "COMPLAINT",
                "New Complaint: " + complaint.getTitle(),
                "Room " + (tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "N/A") + " raised issue: " + complaint.getTitle(),
                "/owner/complaints"
        );

        auditService.log(tenant.getProperty().getId(), tenant.getUser().getId(), "RAISE_COMPLAINT", "Complaint", complaint.getId().toString(),
                "Raised complaint: " + complaint.getTitle());

        return complaint;
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto.Summary> getComplaintsForProperty(UUID propertyId) {
        List<Complaint> complaints = complaintRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId);
        return complaints.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto.Summary> getComplaintsForTenant(UUID tenantId) {
        List<Complaint> complaints = complaintRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        return complaints.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    @Transactional
    public Complaint updateComplaintStatus(UUID complaintId, ComplaintDto.UpdateStatusRequest request, UUID updatedBy) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found"));

        complaint.setStatus(request.getStatus());
        if (request.getAssignedTo() != null) {
            complaint.setAssignedTo(request.getAssignedTo());
        }
        if (request.getResolutionNotes() != null) {
            complaint.setResolutionNotes(request.getResolutionNotes());
        }
        if (request.getStatus() == ComplaintStatus.RESOLVED || request.getStatus() == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(ZonedDateTime.now());
        }

        complaint = complaintRepository.save(complaint);

        // Notify tenant
        notificationService.sendNotification(
                complaint.getTenant().getUser().getId(),
                complaint.getProperty().getId(),
                "COMPLAINT",
                "Complaint #" + complaint.getId().toString().substring(0, 6) + " Update",
                "Status updated to: " + complaint.getStatus() + (complaint.getResolutionNotes() != null ? " (" + complaint.getResolutionNotes() + ")" : ""),
                "/tenant/issues"
        );

        auditService.log(complaint.getProperty().getId(), updatedBy, "UPDATE_COMPLAINT", "Complaint", complaint.getId().toString(),
                "Updated complaint status to " + request.getStatus());

        return complaint;
    }

    private ComplaintDto.Summary mapToSummary(Complaint c) {
        return ComplaintDto.Summary.builder()
                .id(c.getId())
                .propertyId(c.getProperty().getId())
                .tenantId(c.getTenant().getId())
                .tenantName(c.getTenant().getUser().getFullName())
                .tenantPhone(c.getTenant().getUser().getPhone())
                .roomId(c.getRoom() != null ? c.getRoom().getId() : null)
                .roomNumber(c.getRoom() != null ? c.getRoom().getRoomNumber() : "N/A")
                .category(c.getCategory())
                .title(c.getTitle())
                .description(c.getDescription())
                .photoUrl(c.getPhotoUrl())
                .priority(c.getPriority())
                .status(c.getStatus())
                .assignedTo(c.getAssignedTo())
                .resolutionNotes(c.getResolutionNotes())
                .resolvedAt(c.getResolvedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}

