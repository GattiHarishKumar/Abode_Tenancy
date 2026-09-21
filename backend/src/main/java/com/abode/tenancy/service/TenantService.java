package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.*;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.ComplaintDto;
import com.abode.tenancy.dto.RentDto;
import com.abode.tenancy.dto.TenantDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final TenantApplicationRepository applicationRepository;
    private final MealPreferenceRepository mealPreferenceRepository;
    private final RentInvoiceRepository rentInvoiceRepository;
    private final ComplaintRepository complaintRepository;
    private final DocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoomService roomService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<TenantDto.Summary> getTenants(UUID propertyId, String query) {
        List<Tenant> tenants;
        if (query != null && !query.trim().isEmpty()) {
            tenants = tenantRepository.searchTenants(propertyId, query.trim());
        } else {
            tenants = tenantRepository.findByPropertyId(propertyId);
        }

        String currentMonth = String.format("%d-%02d", LocalDate.now().getYear(), LocalDate.now().getMonthValue());

        return tenants.stream().map(t -> {
            Optional<RentInvoice> currentInvoice = rentInvoiceRepository.findByTenantIdAndMonthYear(t.getId(), currentMonth);
            String rentStatus = currentInvoice.map(i -> i.getStatus().name()).orElse("PENDING");
            long openComplaints = complaintRepository.findByTenantIdOrderByCreatedAtDesc(t.getId()).stream()
                    .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED)
                    .count();

            return TenantDto.Summary.builder()
                    .id(t.getId())
                    .userId(t.getUser().getId())
                    .fullName(t.getUser().getFullName())
                    .phone(t.getUser().getPhone())
                    .email(t.getUser().getEmail())
                    .roomId(t.getRoom() != null ? t.getRoom().getId() : null)
                    .roomNumber(t.getRoom() != null ? t.getRoom().getRoomNumber() : null)
                    .bedId(t.getBed() != null ? t.getBed().getId() : null)
                    .bedLabel(t.getBed() != null ? t.getBed().getBedLabel() : null)
                    .sharingType(t.getRoom() != null ? t.getRoom().getSharingType() : 2)
                    .joiningDate(t.getJoiningDate())
                    .rentAmount(t.getRentAmount())
                    .depositAmount(t.getDepositAmount())
                    .status(t.getStatus())
                    .currentMonthRentStatus(rentStatus)
                    .openComplaintsCount((int) openComplaints)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenantDto.Profile360 getTenant360(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        List<RentInvoice> invoices = rentInvoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        List<RentDto.InvoiceItem> invoiceItems = invoices.stream().map(i -> RentDto.InvoiceItem.builder()
                .id(i.getId())
                .tenantId(tenantId)
                .tenantName(tenant.getUser().getFullName())
                .tenantPhone(tenant.getUser().getPhone())
                .roomNumber(tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "")
                .bedLabel(tenant.getBed() != null ? tenant.getBed().getBedLabel() : "")
                .invoiceNumber(i.getInvoiceNumber())
                .monthYear(i.getMonthYear())
                .amount(i.getAmount())
                .discountAmount(i.getDiscountAmount())
                .dueDate(i.getDueDate())
                .status(i.getStatus())
                .paidAmount(i.getPaidAmount())
                .paidDate(i.getPaidDate())
                .build()).collect(Collectors.toList());

        List<Complaint> complaints = complaintRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        List<ComplaintDto.Summary> complaintItems = complaints.stream().map(c -> ComplaintDto.Summary.builder()
                .id(c.getId())
                .propertyId(tenant.getProperty().getId())
                .tenantId(tenantId)
                .tenantName(tenant.getUser().getFullName())
                .tenantPhone(tenant.getUser().getPhone())
                .roomId(c.getRoom() != null ? c.getRoom().getId() : null)
                .roomNumber(c.getRoom() != null ? c.getRoom().getRoomNumber() : "")
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
                .build()).collect(Collectors.toList());

        List<Document> docs = documentRepository.findByTenantId(tenantId);
        int verifiedDocs = (int) docs.stream().filter(Document::getIsVerified).count();

        List<TenantDto.TimelineEvent> timeline = new ArrayList<>();
        timeline.add(TenantDto.TimelineEvent.builder()
                .date(tenant.getJoiningDate().toString())
                .title("Joined PG")
                .category("ONBOARDING")
                .description("Onboarded to Room " + (tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "N/A") +
                        ", " + (tenant.getBed() != null ? tenant.getBed().getBedLabel() : "N/A"))
                .build());

        invoices.stream().filter(i -> i.getStatus() == RentStatus.PAID).forEach(i -> {
            timeline.add(TenantDto.TimelineEvent.builder()
                    .date(i.getPaidDate() != null ? i.getPaidDate().toString() : i.getDueDate().toString())
                    .title("Paid Rent (" + i.getMonthYear() + ")")
                    .category("PAYMENT")
                    .description("Paid ₹" + i.getPaidAmount() + " for invoice " + i.getInvoiceNumber())
                    .build());
        });

        complaints.forEach(c -> {
            timeline.add(TenantDto.TimelineEvent.builder()
                    .date(c.getCreatedAt().toLocalDate().toString())
                    .title("Raised Complaint: " + c.getTitle())
                    .category("COMPLAINT")
                    .description("Category: " + c.getCategory() + " | Status: " + c.getStatus())
                    .build());
        });

        return TenantDto.Profile360.builder()
                .id(tenant.getId())
                .userId(tenant.getUser().getId())
                .fullName(tenant.getUser().getFullName())
                .phone(tenant.getUser().getPhone())
                .email(tenant.getUser().getEmail())
                .avatarUrl(tenant.getUser().getAvatarUrl())
                .propertyId(tenant.getProperty().getId())
                .propertyName(tenant.getProperty().getName())
                .roomId(tenant.getRoom() != null ? tenant.getRoom().getId() : null)
                .roomNumber(tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : null)
                .bedId(tenant.getBed() != null ? tenant.getBed().getId() : null)
                .bedLabel(tenant.getBed() != null ? tenant.getBed().getBedLabel() : null)
                .sharingType(tenant.getRoom() != null ? tenant.getRoom().getSharingType() : 2)
                .joiningDate(tenant.getJoiningDate())
                .vacatingDate(tenant.getVacatingDate())
                .rentAmount(tenant.getRentAmount())
                .depositAmount(tenant.getDepositAmount())
                .status(tenant.getStatus())
                .emergencyContactName(tenant.getEmergencyContactName())
                .emergencyContactPhone(tenant.getEmergencyContactPhone())
                .recentInvoices(invoiceItems)
                .complaints(complaintItems)
                .activityTimeline(timeline)
                .verifiedDocumentsCount(verifiedDocs)
                .totalDocumentsCount(docs.size())
                .build();
    }

    @Transactional
    public Tenant onboardTenant(UUID propertyId, TenantDto.OnboardRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        Bed bed = bedRepository.findById(request.getBedId())
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));

        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new IllegalStateException("Bed " + bed.getBedLabel() + " is already occupied");
        }

        // Check or create user
        User user = userRepository.findByPhone(request.getPhone()).orElseGet(() -> {
            User newUser = User.builder()
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode("Tenant@123"))
                    .role(Role.TENANT)
                    .status(UserStatus.ACTIVE)
                    .languagePreference("en")
                    .build();
            return userRepository.save(newUser);
        });

        // Create Tenant entity
        Tenant tenant = Tenant.builder()
                .user(user)
                .property(property)
                .room(room)
                .bed(bed)
                .joiningDate(request.getJoiningDate())
                .rentAmount(request.getRentAmount())
                .depositAmount(request.getDepositAmount() != null ? request.getDepositAmount() : BigDecimal.ZERO)
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .status(TenantStatus.ACTIVE)
                .build();

        tenant = tenantRepository.save(tenant);

        // Update Bed status and Room occupancy
        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);
        roomService.updateRoomStatus(room.getId());

        // Create default meal preferences (all YES by default)
        MealPreference mealPref = MealPreference.builder()
                .tenant(tenant)
                .weekdayBreakfast(true)
                .weekdayLunch(true)
                .weekdayDinner(true)
                .weekendBreakfast(true)
                .weekendLunch(true)
                .weekendDinner(true)
                .build();
        mealPreferenceRepository.save(mealPref);

        // Update Application status if applicable
        if (request.getApplicationId() != null) {
            applicationRepository.findById(request.getApplicationId()).ifPresent(app -> {
                app.setStatus(ApplicationStatus.ONBOARDED);
                applicationRepository.save(app);
            });
        }

        // Send welcome notification
        notificationService.sendNotification(
                user.getId(),
                property.getId(),
                "SYSTEM",
                "Welcome to " + property.getName() + "!",
                "You have been assigned Room " + room.getRoomNumber() + ", " + bed.getBedLabel() + ".",
                "/tenant/dashboard"
        );

        auditService.log(propertyId, user.getId(), "ONBOARD", "Tenant", tenant.getId().toString(),
                "Onboarded tenant " + user.getFullName() + " into Room " + room.getRoomNumber());

        return tenant;
    }

    @Transactional
    public void transferRoom(UUID tenantId, TenantDto.TransferRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Bed oldBed = tenant.getBed();
        Room oldRoom = tenant.getRoom();

        Room newRoom = roomRepository.findById(request.getNewRoomId())
                .orElseThrow(() -> new IllegalArgumentException("New room not found"));
        Bed newBed = bedRepository.findById(request.getNewBedId())
                .orElseThrow(() -> new IllegalArgumentException("New bed not found"));

        if (newBed.getStatus() == BedStatus.OCCUPIED) {
            throw new IllegalStateException("Target bed is already occupied");
        }

        // Free old bed
        if (oldBed != null) {
            oldBed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(oldBed);
        }

        // Allocate new bed
        newBed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(newBed);

        // Update tenant
        tenant.setRoom(newRoom);
        tenant.setBed(newBed);
        if (request.getNewRentAmount() != null) {
            tenant.setRentAmount(request.getNewRentAmount());
        }
        tenantRepository.save(tenant);

        // Recalculate room occupancy
        if (oldRoom != null) {
            roomService.updateRoomStatus(oldRoom.getId());
        }
        roomService.updateRoomStatus(newRoom.getId());

        auditService.log(tenant.getProperty().getId(), tenant.getUser().getId(), "TRANSFER", "Tenant", tenant.getId().toString(),
                "Transferred from Room " + (oldRoom != null ? oldRoom.getRoomNumber() : "N/A") + " to Room " + newRoom.getRoomNumber());
    }

    @Transactional
    public void vacateTenant(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Bed bed = tenant.getBed();
        Room room = tenant.getRoom();

        if (bed != null) {
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
        }

        tenant.setBed(null);
        tenant.setStatus(TenantStatus.VACATED);
        tenant.setVacatingDate(LocalDate.now());
        tenantRepository.save(tenant);

        if (room != null) {
            roomService.updateRoomStatus(room.getId());
        }

        auditService.log(tenant.getProperty().getId(), tenant.getUser().getId(), "VACATE", "Tenant", tenant.getId().toString(),
                "Vacated tenant " + tenant.getUser().getFullName());
    }

    @Transactional
    public TenantDto.SettlementResponse settleDeposit(UUID tenantId, TenantDto.SettlementRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        BigDecimal depositHeld = request.getDepositHeld() != null ? request.getDepositHeld() : tenant.getDepositAmount();
        BigDecimal paintingDeduction = request.getPaintingCleaningDeduction() != null ? request.getPaintingCleaningDeduction() : BigDecimal.ZERO;
        BigDecimal unpaidDues = request.getUnpaidDues() != null ? request.getUnpaidDues() : BigDecimal.ZERO;
        BigDecimal damageDeductions = request.getDamageDeductions() != null ? request.getDamageDeductions() : BigDecimal.ZERO;

        BigDecimal totalDeductions = paintingDeduction.add(unpaidDues).add(damageDeductions);
        BigDecimal netRefund = depositHeld.subtract(totalDeductions);
        if (netRefund.compareTo(BigDecimal.ZERO) < 0) {
            netRefund = BigDecimal.ZERO;
        }

        // Vacate bed and mark tenant as vacated
        Bed bed = tenant.getBed();
        Room room = tenant.getRoom();

        if (bed != null) {
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
        }

        tenant.setBed(null);
        tenant.setStatus(TenantStatus.VACATED);
        tenant.setVacatingDate(request.getVacatingDate() != null ? request.getVacatingDate() : LocalDate.now());
        tenantRepository.save(tenant);

        if (room != null) {
            roomService.updateRoomStatus(room.getId());
        }

        auditService.log(tenant.getProperty().getId(), tenant.getUser().getId(), "SETTLEMENT", "Tenant", tenant.getId().toString(),
                "Settled security deposit for " + tenant.getUser().getFullName() + ". Refund: ₹" + netRefund + " (Deductions: ₹" + totalDeductions + ")");

        return TenantDto.SettlementResponse.builder()
                .tenantId(tenant.getId())
                .tenantName(tenant.getUser().getFullName())
                .depositHeld(depositHeld)
                .totalDeductions(totalDeductions)
                .netRefundAmount(netRefund)
                .settlementDate(LocalDate.now().toString())
                .status("SETTLED")
                .notes(request.getDeductionNotes() != null ? request.getDeductionNotes() : "Standard move-out settlement completed.")
                .build();
    }

    @Transactional(readOnly = true)
    public List<TenantDto.NoticePeriodItem> getNoticePeriodTenants(UUID propertyId) {
        List<Tenant> tenants = tenantRepository.findByPropertyId(propertyId);
        LocalDate today = LocalDate.now();

        return tenants.stream()
                .filter(t -> t.getVacatingDate() != null || (t.getStatus() != null && t.getStatus().name().equals("ON_NOTICE")))
                .map(t -> {
                    LocalDate vacDate = t.getVacatingDate() != null ? t.getVacatingDate() : today.plusDays(30);
                    long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, vacDate);
                    return TenantDto.NoticePeriodItem.builder()
                            .tenantId(t.getId())
                            .tenantName(t.getUser().getFullName())
                            .tenantPhone(t.getUser().getPhone())
                            .roomId(t.getRoom() != null ? t.getRoom().getId() : null)
                            .roomNumber(t.getRoom() != null ? t.getRoom().getRoomNumber() : "N/A")
                            .bedId(t.getBed() != null ? t.getBed().getId() : null)
                            .bedLabel(t.getBed() != null ? t.getBed().getBedLabel() : "N/A")
                            .vacatingDate(vacDate.toString())
                            .daysRemaining(Math.max(0, daysRemaining))
                            .depositHeld(t.getDepositAmount())
                            .rentAmount(t.getRentAmount())
                            .build();
                })
                .sorted(Comparator.comparing(TenantDto.NoticePeriodItem::getDaysRemaining))
                .collect(Collectors.toList());
    }
}
