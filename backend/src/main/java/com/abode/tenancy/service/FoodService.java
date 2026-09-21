package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.MealPrepState;
import com.abode.tenancy.domain.enums.MealType;
import com.abode.tenancy.domain.enums.TenantStatus;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.FoodDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final MenuRepository menuRepository;
    private final MealConfirmationRepository mealConfirmationRepository;
    private final MealPrepStatusRepository mealPrepStatusRepository;
    private final MealPreferenceRepository mealPreferenceRepository;
    private final FoodRatingRepository foodRatingRepository;
    private final FoodWasteEntryRepository foodWasteEntryRepository;
    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public Menu saveMenu(UUID propertyId, FoodDto.SaveMenuRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        Menu menu = menuRepository.findByPropertyIdAndMenuDate(propertyId, request.getMenuDate())
                .orElseGet(() -> Menu.builder()
                        .property(property)
                        .menuDate(request.getMenuDate())
                        .build());

        menu.setBreakfastItems(request.getBreakfastItems());
        menu.setBreakfastStart(request.getBreakfastStart());
        menu.setBreakfastEnd(request.getBreakfastEnd());
        menu.setLunchItems(request.getLunchItems());
        menu.setLunchStart(request.getLunchStart());
        menu.setLunchEnd(request.getLunchEnd());
        menu.setDinnerItems(request.getDinnerItems());
        menu.setDinnerStart(request.getDinnerStart());
        menu.setDinnerEnd(request.getDinnerEnd());
        menu.setIsPublished(request.getIsPublished());

        menu = menuRepository.save(menu);

        if (Boolean.TRUE.equals(request.getIsPublished())) {
            // Send menu broadcast notification to all active tenants in property
            List<Tenant> tenants = tenantRepository.findByPropertyIdAndStatus(propertyId, TenantStatus.ACTIVE);
            for (Tenant t : tenants) {
                notificationService.sendNotification(
                        t.getUser().getId(),
                        propertyId,
                        "FOOD",
                        "Menu Posted for " + request.getMenuDate(),
                        "Check tomorrow's menu and confirm your meals.",
                        "/tenant/meals"
                );
            }
        }

        auditService.log(propertyId, null, "SAVE_MENU", "Menu", menu.getId().toString(),
                "Saved menu for date " + request.getMenuDate());

        return menu;
    }

    @Transactional(readOnly = true)
    public FoodDto.MenuResponse getMenuForDate(UUID propertyId, LocalDate date) {
        Optional<Menu> menuOpt = menuRepository.findByPropertyIdAndMenuDate(propertyId, date);
        if (menuOpt.isEmpty()) {
            return FoodDto.MenuResponse.builder()
                    .propertyId(propertyId)
                    .menuDate(date)
                    .breakfastItems("Idli, Vada, Sambar, Chutney, Tea / Coffee")
                    .breakfastStart("08:00")
                    .breakfastEnd("10:00")
                    .lunchItems("Rice, Dal Tadka, Seasonal Veg Curry, Curd, Papad")
                    .lunchStart("12:30")
                    .lunchEnd("14:30")
                    .dinnerItems("Phulka Roti, Paneer Butter Masala, Jeera Rice, Dal Fry")
                    .dinnerStart("19:30")
                    .dinnerEnd("21:30")
                    .isPublished(true)
                    .build();
        }

        Menu menu = menuOpt.get();
        return FoodDto.MenuResponse.builder()
                .id(menu.getId())
                .propertyId(propertyId)
                .menuDate(menu.getMenuDate())
                .breakfastItems(menu.getBreakfastItems())
                .breakfastStart(menu.getBreakfastStart())
                .breakfastEnd(menu.getBreakfastEnd())
                .lunchItems(menu.getLunchItems())
                .lunchStart(menu.getLunchStart())
                .lunchEnd(menu.getLunchEnd())
                .dinnerItems(menu.getDinnerItems())
                .dinnerStart(menu.getDinnerStart())
                .dinnerEnd(menu.getDinnerEnd())
                .isPublished(menu.getIsPublished())
                .build();
    }

    @Transactional
    public MealConfirmation confirmMeal(UUID tenantId, FoodDto.MealConfirmRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        // Validate Cutoff time
        if (isCutoffPassed(request.getDate(), request.getMealType())) {
            throw new IllegalStateException("Confirmation window for " + request.getMealType() + " is closed. Please contact PG management.");
        }

        MealConfirmation confirmation = mealConfirmationRepository
                .findByTenantIdAndDateAndMealType(tenantId, request.getDate(), request.getMealType())
                .orElseGet(() -> MealConfirmation.builder()
                        .tenant(tenant)
                        .property(tenant.getProperty())
                        .date(request.getDate())
                        .mealType(request.getMealType())
                        .build());

        confirmation.setIsAttending(request.getIsAttending());
        return mealConfirmationRepository.save(confirmation);
    }

    @Transactional(readOnly = true)
    public List<FoodDto.MealConfirmationItem> getTenantConfirmations(UUID tenantId, LocalDate date) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        FoodDto.MenuResponse menu = getMenuForDate(tenant.getProperty().getId(), date);
        List<MealConfirmation> confirmations = mealConfirmationRepository.findByTenantIdAndDate(tenantId, date);
        Map<MealType, Boolean> attendingMap = confirmations.stream()
                .collect(Collectors.toMap(MealConfirmation::getMealType, MealConfirmation::getIsAttending));

        MealPreference pref = mealPreferenceRepository.findByTenantId(tenantId).orElse(null);
        boolean isWeekend = date.getDayOfWeek().getValue() >= 6;

        return Arrays.stream(MealType.values()).map(type -> {
            boolean defaultAttending = true;
            if (pref != null) {
                if (type == MealType.BREAKFAST) defaultAttending = isWeekend ? pref.getWeekendBreakfast() : pref.getWeekdayBreakfast();
                else if (type == MealType.LUNCH) defaultAttending = isWeekend ? pref.getWeekendLunch() : pref.getWeekdayLunch();
                else if (type == MealType.DINNER) defaultAttending = isWeekend ? pref.getWeekendDinner() : pref.getWeekdayDinner();
            }

            Boolean isAttending = attendingMap.getOrDefault(type, defaultAttending);
            String timing = type == MealType.BREAKFAST ? menu.getBreakfastStart() + " - " + menu.getBreakfastEnd()
                    : type == MealType.LUNCH ? menu.getLunchStart() + " - " + menu.getLunchEnd()
                    : menu.getDinnerStart() + " - " + menu.getDinnerEnd();

            String items = type == MealType.BREAKFAST ? menu.getBreakfastItems()
                    : type == MealType.LUNCH ? menu.getLunchItems() : menu.getDinnerItems();

            return FoodDto.MealConfirmationItem.builder()
                    .mealType(type)
                    .isAttending(isAttending)
                    .isCutoffPassed(isCutoffPassed(date, type))
                    .timing(timing)
                    .items(items)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FoodDto.CookDashboard getCookDashboard(UUID propertyId, LocalDate date, String cookLanguage) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        FoodDto.MenuResponse menu = getMenuForDate(propertyId, date);
        long activeTenants = tenantRepository.countByPropertyIdAndStatus(propertyId, TenantStatus.ACTIVE);

        List<MealPrepStatus> prepStatuses = mealPrepStatusRepository.findByPropertyIdAndDate(propertyId, date);
        Map<MealType, MealPrepStatus> statusMap = prepStatuses.stream()
                .collect(Collectors.toMap(MealPrepStatus::getMealType, s -> s));

        List<FoodDto.CookMealCard> mealCards = Arrays.stream(MealType.values()).map(type -> {
            long confirmed = mealConfirmationRepository.countByPropertyIdAndDateAndMealTypeAndIsAttending(
                    propertyId, date, type, true);

            // If no confirmations recorded yet, default expectation is based on active occupancy
            long expected = confirmed > 0 ? confirmed : Math.max(activeTenants, 0);

            MealPrepStatus ps = statusMap.get(type);
            MealPrepState state = ps != null ? ps.getStatus() : MealPrepState.NOT_STARTED;
            Integer prepCount = ps != null ? ps.getPreparedCount() : (int) expected;

            String timing = type == MealType.BREAKFAST ? menu.getBreakfastStart() + " - " + menu.getBreakfastEnd()
                    : type == MealType.LUNCH ? menu.getLunchStart() + " - " + menu.getLunchEnd()
                    : menu.getDinnerStart() + " - " + menu.getDinnerEnd();

            String items = type == MealType.BREAKFAST ? menu.getBreakfastItems()
                    : type == MealType.LUNCH ? menu.getLunchItems() : menu.getDinnerItems();

            return FoodDto.CookMealCard.builder()
                    .mealType(type)
                    .title(type.name())
                    .timing(timing)
                    .items(items)
                    .confirmedCount(confirmed)
                    .expectedCount(expected)
                    .status(state)
                    .preparedCount(prepCount)
                    .ingredients(calculateRuleBasedIngredients(type, expected))
                    .build();
        }).collect(Collectors.toList());

        return FoodDto.CookDashboard.builder()
                .date(date)
                .propertyId(propertyId)
                .propertyName(property.getName())
                .cookLanguage(cookLanguage != null ? cookLanguage : "en")
                .meals(mealCards)
                .build();
    }

    @Transactional
    public void updateMealPrepStatus(UUID propertyId, LocalDate date, MealType mealType, FoodDto.UpdatePrepStatusRequest request, UUID userId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        MealPrepStatus prepStatus = mealPrepStatusRepository
                .findByPropertyIdAndDateAndMealType(propertyId, date, mealType)
                .orElseGet(() -> MealPrepStatus.builder()
                        .property(property)
                        .date(date)
                        .mealType(mealType)
                        .build());

        prepStatus.setStatus(request.getStatus());
        if (request.getPreparedCount() != null) {
            prepStatus.setPreparedCount(request.getPreparedCount());
        }
        prepStatus.setUpdatedBy(user);
        mealPrepStatusRepository.save(prepStatus);

        auditService.log(propertyId, userId, "UPDATE_MEAL_PREP", "MealPrepStatus", prepStatus.getId().toString(),
                "Updated " + mealType + " status to " + request.getStatus());
    }

    @Transactional
    public void recordFoodWaste(UUID propertyId, LocalDate date, FoodDto.WasteEntryRequest request, UUID userId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        FoodWasteEntry entry = FoodWasteEntry.builder()
                .property(property)
                .date(date)
                .mealType(request.getMealType())
                .leftoverKg(request.getLeftoverKg())
                .reason(request.getReason())
                .enteredBy(user)
                .build();

        foodWasteEntryRepository.save(entry);
        auditService.log(propertyId, userId, "RECORD_WASTE", "FoodWasteEntry", entry.getId().toString(),
                "Recorded leftover " + request.getLeftoverKg() + " kg for " + request.getMealType());
    }

    @Transactional
    public void submitFoodRating(UUID tenantId, LocalDate date, FoodDto.SubmitRatingRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        FoodRating rating = FoodRating.builder()
                .property(tenant.getProperty())
                .tenant(tenant)
                .date(date)
                .mealType(request.getMealType())
                .rating(request.getRating())
                .tasteRating(request.getTasteRating())
                .qualityRating(request.getQualityRating())
                .quantityRating(request.getQuantityRating())
                .comments(request.getComments())
                .build();

        foodRatingRepository.save(rating);
    }

    public boolean isCutoffPassed(LocalDate mealDate, MealType mealType) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        LocalTime now = LocalTime.now(ZoneId.of("Asia/Kolkata"));

        if (mealDate.isBefore(today)) return true;

        if (mealDate.isEqual(today)) {
            if (mealType == MealType.BREAKFAST) return true; // Breakfast closes 9:00 PM previous day
            if (mealType == MealType.LUNCH) return now.isAfter(LocalTime.of(9, 0)); // Lunch closes 9:00 AM
            if (mealType == MealType.DINNER) return now.isAfter(LocalTime.of(15, 0)); // Dinner closes 3:00 PM
        }

        if (mealDate.isEqual(today.plusDays(1))) {
            if (mealType == MealType.BREAKFAST) return now.isAfter(LocalTime.of(21, 0)); // 9:00 PM previous day
        }

        return false;
    }

    private List<FoodDto.IngredientEstimate> calculateRuleBasedIngredients(MealType mealType, long headCount) {
        List<FoodDto.IngredientEstimate> list = new ArrayList<>();
        if (headCount <= 0) return list;

        BigDecimal count = BigDecimal.valueOf(headCount);
        if (mealType == MealType.BREAKFAST) {
            list.add(new FoodDto.IngredientEstimate("Idli/Vada Batter", count.multiply(new BigDecimal("0.18")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Dal (for Sambar)", count.multiply(new BigDecimal("0.04")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Coconut (for Chutney)", count.multiply(new BigDecimal("0.03")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Milk (Tea/Coffee)", count.multiply(new BigDecimal("0.12")).setScale(1, RoundingMode.HALF_UP) + " L"));
        } else if (mealType == MealType.LUNCH) {
            list.add(new FoodDto.IngredientEstimate("Rice", count.multiply(new BigDecimal("0.15")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Dal", count.multiply(new BigDecimal("0.055")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Vegetables", count.multiply(new BigDecimal("0.11")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Curd", count.multiply(new BigDecimal("0.08")).setScale(1, RoundingMode.HALF_UP) + " kg"));
        } else if (mealType == MealType.DINNER) {
            list.add(new FoodDto.IngredientEstimate("Wheat Flour (Atta)", count.multiply(new BigDecimal("0.10")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Paneer / Veg", count.multiply(new BigDecimal("0.12")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Rice", count.multiply(new BigDecimal("0.08")).setScale(1, RoundingMode.HALF_UP) + " kg"));
            list.add(new FoodDto.IngredientEstimate("Dal", count.multiply(new BigDecimal("0.04")).setScale(1, RoundingMode.HALF_UP) + " kg"));
        }
        return list;
    }
}

