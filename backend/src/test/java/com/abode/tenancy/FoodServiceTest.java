package com.abode.tenancy;

import com.abode.tenancy.domain.enums.*;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.FoodDto;
import com.abode.tenancy.service.FoodService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class FoodServiceTest {

    @Autowired
    private FoodService foodService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Property property;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        User owner = userRepository.save(User.builder()
                .fullName("Food Owner")
                .phone("9888800001")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.OWNER)
                .build());

        property = propertyRepository.save(Property.builder()
                .owner(owner)
                .name("Food Test PG")
                .slug("food-test-pg")
                .address("AECS Layout")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560037")
                .contactPhone("9888800001")
                .build());

        Room room = roomRepository.save(Room.builder()
                .property(property)
                .roomNumber("101")
                .sharingType(2)
                .baseRent(new BigDecimal("10000.00"))
                .build());

        Bed bed = bedRepository.save(Bed.builder()
                .room(room)
                .bedLabel("Bed A")
                .status(BedStatus.OCCUPIED)
                .build());

        User tenantUser = userRepository.save(User.builder()
                .fullName("Food Tenant")
                .phone("9888800002")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.TENANT)
                .build());

        tenant = tenantRepository.save(Tenant.builder()
                .user(tenantUser)
                .property(property)
                .room(room)
                .bed(bed)
                .joiningDate(LocalDate.now())
                .rentAmount(new BigDecimal("10000.00"))
                .status(TenantStatus.ACTIVE)
                .build());
    }

    @Test
    @DisplayName("Menu management: Save menu and verify retrieval")
    void testSaveAndGetMenu() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        FoodDto.SaveMenuRequest request = new FoodDto.SaveMenuRequest(
                tomorrow,
                "Poha, Jalebi", "08:00", "10:00",
                "Rajma Chawal, Curd", "12:30", "14:30",
                "Roti, Paneer Bhurji, Dal", "19:30", "21:30",
                true
        );

        Menu saved = foodService.saveMenu(property.getId(), request);
        assertNotNull(saved.getId());

        FoodDto.MenuResponse retrieved = foodService.getMenuForDate(property.getId(), tomorrow);
        assertEquals("Poha, Jalebi", retrieved.getBreakfastItems());
        assertEquals("Rajma Chawal, Curd", retrieved.getLunchItems());
    }

    @Test
    @DisplayName("Meal confirmation & Cook dashboard count calculation")
    void testMealConfirmationAndCookCount() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Tenant confirms Lunch for tomorrow
        FoodDto.MealConfirmRequest confirmReq = new FoodDto.MealConfirmRequest(tomorrow, MealType.LUNCH, true);
        MealConfirmation conf = foodService.confirmMeal(tenant.getId(), confirmReq);
        assertTrue(conf.getIsAttending());

        // Cook checks dashboard
        FoodDto.CookDashboard dashboard = foodService.getCookDashboard(property.getId(), tomorrow, "en");
        assertNotNull(dashboard);
        assertEquals(3, dashboard.getMeals().size());

        FoodDto.CookMealCard lunchCard = dashboard.getMeals().stream()
                .filter(m -> m.getMealType() == MealType.LUNCH)
                .findFirst().orElseThrow();

        assertEquals(1, lunchCard.getConfirmedCount());
        assertFalse(lunchCard.getIngredients().isEmpty());
    }
}

