package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.*;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.AnnouncementDto;
import com.abode.tenancy.dto.ComplaintDto;
import com.abode.tenancy.dto.FoodDto;
import com.abode.tenancy.dto.OperationsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperationsService {

    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;
    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;
    private final RentInvoiceRepository rentInvoiceRepository;
    private final ComplaintRepository complaintRepository;
    private final TenantApplicationRepository applicationRepository;
    private final VacatingRequestRepository vacatingRequestRepository;
    private final FoodService foodService;
    private final MealConfirmationRepository mealConfirmationRepository;
    private final MealPrepStatusRepository mealPrepStatusRepository;
    private final AnnouncementRepository announcementRepository;

    @Transactional(readOnly = true)
    public OperationsDto.OwnerDashboard getOwnerDashboard(UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        String currentMonth = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // Key counts
        long totalTenants = tenantRepository.countByPropertyIdAndStatus(propertyId, TenantStatus.ACTIVE);
        long totalBeds = bedRepository.countByRoomPropertyId(propertyId);
        long occupiedBeds = bedRepository.countByRoomPropertyIdAndStatus(propertyId, BedStatus.OCCUPIED);
        long availableBeds = bedRepository.countByRoomPropertyIdAndStatus(propertyId, BedStatus.AVAILABLE);
        double occupancyRate = totalBeds > 0 ? ((double) occupiedBeds / totalBeds) * 100.0 : 0.0;

        BigDecimal pendingRent = rentInvoiceRepository.getTotalPendingRent(propertyId);
        if (pendingRent == null) pendingRent = BigDecimal.ZERO;
        long pendingRentCount = rentInvoiceRepository.countByPropertyIdAndStatus(propertyId, RentStatus.PENDING);

        long openComplaintsCount = complaintRepository.countByPropertyIdAndStatusNot(propertyId, ComplaintStatus.RESOLVED);
        long pendingAppsCount = applicationRepository.countByPropertyIdAndStatus(propertyId, ApplicationStatus.PENDING);
        long vacatingSoonCount = vacatingRequestRepository.countByPropertyIdAndStatus(propertyId, VacateStatus.PENDING);

        // Meals today
        FoodDto.CookDashboard cookDash = foodService.getCookDashboard(propertyId, today, "en");
        Map<MealType, FoodDto.CookMealCard> mealCardMap = cookDash.getMeals().stream()
                .collect(Collectors.toMap(FoodDto.CookMealCard::getMealType, m -> m));

        FoodDto.CookMealCard bMeal = mealCardMap.get(MealType.BREAKFAST);
        FoodDto.CookMealCard lMeal = mealCardMap.get(MealType.LUNCH);
        FoodDto.CookMealCard dMeal = mealCardMap.get(MealType.DINNER);

        OperationsDto.MealCounter bCounter = OperationsDto.MealCounter.builder()
                .confirmed(bMeal != null ? bMeal.getConfirmedCount() : 0)
                .expected(bMeal != null ? bMeal.getExpectedCount() : totalTenants)
                .notConfirmed(Math.max(0, totalTenants - (bMeal != null ? bMeal.getConfirmedCount() : 0)))
                .prepStatus(bMeal != null ? bMeal.getStatus().name() : "NOT_STARTED")
                .build();

        OperationsDto.MealCounter lCounter = OperationsDto.MealCounter.builder()
                .confirmed(lMeal != null ? lMeal.getConfirmedCount() : 0)
                .expected(lMeal != null ? lMeal.getExpectedCount() : totalTenants)
                .notConfirmed(Math.max(0, totalTenants - (lMeal != null ? lMeal.getConfirmedCount() : 0)))
                .prepStatus(lMeal != null ? lMeal.getStatus().name() : "NOT_STARTED")
                .build();

        OperationsDto.MealCounter dCounter = OperationsDto.MealCounter.builder()
                .confirmed(dMeal != null ? dMeal.getConfirmedCount() : 0)
                .expected(dMeal != null ? dMeal.getExpectedCount() : totalTenants)
                .notConfirmed(Math.max(0, totalTenants - (dMeal != null ? dMeal.getConfirmedCount() : 0)))
                .prepStatus(dMeal != null ? dMeal.getStatus().name() : "NOT_STARTED")
                .build();

        // Action Center Items
        List<OperationsDto.ActionItem> actionItems = new ArrayList<>();
        if (openComplaintsCount > 0) {
            actionItems.add(OperationsDto.ActionItem.builder()
                    .id("action-complaints")
                    .level("CRITICAL")
                    .title(openComplaintsCount + " complaints need attention")
                    .description("Plumbing, Electrical, or Room issues raised by tenants")
                    .link("/owner/complaints")
                    .count(String.valueOf(openComplaintsCount))
                    .build());
        }
        if (pendingRentCount > 0) {
            actionItems.add(OperationsDto.ActionItem.builder()
                    .id("action-rent")
                    .level("WARNING")
                    .title(pendingRentCount + " rent payments pending")
                    .description("Total pending dues: ₹" + pendingRent)
                    .link("/owner/rent")
                    .count("₹" + pendingRent)
                    .build());
        }
        if (pendingAppsCount > 0) {
            actionItems.add(OperationsDto.ActionItem.builder()
                    .id("action-apps")
                    .level("WARNING")
                    .title(pendingAppsCount + " new tenant applications")
                    .description("Review prospective tenant joining requests")
                    .link("/owner/applications")
                    .count(String.valueOf(pendingAppsCount))
                    .build());
        }
        if (vacatingSoonCount > 0) {
            actionItems.add(OperationsDto.ActionItem.builder()
                    .id("action-vacate")
                    .level("INFO")
                    .title(vacatingSoonCount + " tenants' notice period ending soon")
                    .description("Prepare exit checklist and settlement")
                    .link("/owner/tenants")
                    .count(String.valueOf(vacatingSoonCount))
                    .build());
        }
        if (bMeal != null && bMeal.getStatus() == MealPrepState.COMPLETED) {
            actionItems.add(OperationsDto.ActionItem.builder()
                    .id("action-breakfast")
                    .level("SUCCESS")
                    .title("Breakfast preparation completed")
                    .description(bMeal.getPreparedCount() + " servings prepared")
                    .link("/owner/food")
                    .count("✓")
                    .build());
        }

        OperationsDto.TodayOperations ops = OperationsDto.TodayOperations.builder()
                .propertyStatus(occupiedBeds + " / " + totalBeds + " beds occupied (" + Math.round(occupancyRate) + "%)")
                .rentStatus(pendingRentCount + " payments pending (₹" + pendingRent + ")")
                .breakfastStatus(bCounter.getConfirmed() + " confirmed | " + bCounter.getPrepStatus())
                .lunchStatus(lCounter.getConfirmed() + " confirmed | " + lCounter.getPrepStatus())
                .dinnerStatus(dCounter.getConfirmed() + " confirmed | " + dCounter.getPrepStatus())
                .issuesStatus(openComplaintsCount + " open complaints")
                .newTenantsStatus(pendingAppsCount + " new applications")
                .vacatingStatus(vacatingSoonCount + " upcoming move-outs")
                .build();

        return OperationsDto.OwnerDashboard.builder()
                .propertyId(property.getId())
                .propertyName(property.getName())
                .city(property.getCity())
                .date(today.toString())
                .totalTenants(totalTenants)
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .availableBeds(availableBeds)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .pendingRent(pendingRent)
                .pendingRentCount(pendingRentCount)
                .openComplaintsCount(openComplaintsCount)
                .pendingApplicationsCount(pendingAppsCount)
                .vacatingSoonCount(vacatingSoonCount)
                .breakfast(bCounter)
                .lunch(lCounter)
                .dinner(dCounter)
                .actionCenter(actionItems)
                .operations(ops)
                .build();
    }

    @Transactional(readOnly = true)
    public OperationsDto.TenantDayView getTenantDayView(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        String currentMonth = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<FoodDto.MealConfirmationItem> mealItems = foodService.getTenantConfirmations(tenantId, today);
        List<OperationsDto.TenantMealCard> mealCards = mealItems.stream().map(m -> OperationsDto.TenantMealCard.builder()
                .mealType(m.getMealType().name())
                .title(m.getMealType().name())
                .timing(m.getTiming())
                .items(m.getItems())
                .isAttending(m.getIsAttending())
                .isCutoffPassed(m.getIsCutoffPassed())
                .build()).collect(Collectors.toList());

        Optional<RentInvoice> currentInvoice = rentInvoiceRepository.findByTenantIdAndMonthYear(tenantId, currentMonth);
        String rentStatus = "PAID";
        String rentDueDate = "N/A";
        BigDecimal dueAmount = BigDecimal.ZERO;

        if (currentInvoice.isPresent()) {
            RentInvoice inv = currentInvoice.get();
            rentStatus = inv.getStatus().name();
            rentDueDate = inv.getDueDate().toString();
            dueAmount = inv.getAmount().subtract(inv.getPaidAmount());
        }

        List<Complaint> complaints = complaintRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        List<ComplaintDto.Summary> activeComplaints = complaints.stream()
                .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED)
                .map(c -> ComplaintDto.Summary.builder()
                        .id(c.getId())
                        .category(c.getCategory())
                        .title(c.getTitle())
                        .status(c.getStatus())
                        .priority(c.getPriority())
                        .createdAt(c.getCreatedAt())
                        .build()).collect(Collectors.toList());

        List<Announcement> announcements = announcementRepository.findByPropertyIdOrderByCreatedAtDesc(tenant.getProperty().getId());
        List<AnnouncementDto.Summary> recentAnnouncements = announcements.stream().limit(3).map(a -> AnnouncementDto.Summary.builder()
                .id(a.getId())
                .title(a.getTitle())
                .message(a.getMessage())
                .isPinned(a.getIsPinned())
                .createdAt(a.getCreatedAt())
                .build()).collect(Collectors.toList());

        return OperationsDto.TenantDayView.builder()
                .tenantName(tenant.getUser().getFullName())
                .propertyName(tenant.getProperty().getName())
                .roomNumber(tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "N/A")
                .bedLabel(tenant.getBed() != null ? tenant.getBed().getBedLabel() : "N/A")
                .todayDate(today.toString())
                .todayMeals(mealCards)
                .rentStatus(rentStatus)
                .rentDueDate(rentDueDate)
                .rentDueAmount(dueAmount)
                .activeComplaints(activeComplaints)
                .recentAnnouncements(recentAnnouncements)
                .build();
    }
}

