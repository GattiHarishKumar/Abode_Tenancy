package com.abode.tenancy;

import com.abode.tenancy.domain.enums.*;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.TenantDto;
import com.abode.tenancy.service.RoomService;
import com.abode.tenancy.service.TenantService;
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

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TenantServiceTest {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private RoomService roomService;

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
    private Room room1;
    private Room room2;
    private Bed bed1A;
    private Bed bed1B;
    private Bed bed2A;

    @BeforeEach
    void setUp() {
        User owner = userRepository.save(User.builder()
                .fullName("Tenancy Owner")
                .phone("9666600001")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.OWNER)
                .build());

        property = propertyRepository.save(Property.builder()
                .owner(owner)
                .name("Tenant Test PG")
                .slug("tenant-test-pg")
                .address("Bengaluru")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560037")
                .contactPhone("9666600001")
                .build());

        room1 = roomRepository.save(Room.builder().property(property).roomNumber("101").sharingType(2).baseRent(new BigDecimal("10000.00")).status(RoomStatus.AVAILABLE).build());
        bed1A = bedRepository.save(Bed.builder().room(room1).bedLabel("Bed A").status(BedStatus.AVAILABLE).build());
        bed1B = bedRepository.save(Bed.builder().room(room1).bedLabel("Bed B").status(BedStatus.AVAILABLE).build());

        room2 = roomRepository.save(Room.builder().property(property).roomNumber("102").sharingType(1).baseRent(new BigDecimal("18000.00")).status(RoomStatus.AVAILABLE).build());
        bed2A = bedRepository.save(Bed.builder().room(room2).bedLabel("Bed A").status(BedStatus.AVAILABLE).build());
    }

    @Test
    @DisplayName("Tenant Onboarding, 360 profile, Transfer, and Vacating")
    void testTenantLifecycle() {
        // 1. Onboard Tenant
        TenantDto.OnboardRequest onboardReq = new TenantDto.OnboardRequest(
                "New Tenant",
                "9666600002",
                "new.tenant@test.com",
                room1.getId(),
                bed1A.getId(),
                LocalDate.now(),
                new BigDecimal("10000.00"),
                new BigDecimal("15000.00"),
                "Emergency Person",
                "9666600099",
                null
        );

        Tenant tenant = tenantService.onboardTenant(property.getId(), onboardReq);
        assertNotNull(tenant.getId());
        assertEquals(BedStatus.OCCUPIED, bedRepository.findById(bed1A.getId()).get().getStatus());

        // 2. Fetch 360 Profile
        TenantDto.Profile360 profile = tenantService.getTenant360(tenant.getId());
        assertEquals("New Tenant", profile.getFullName());
        assertEquals("101", profile.getRoomNumber());
        assertEquals("Bed A", profile.getBedLabel());
        assertFalse(profile.getActivityTimeline().isEmpty());

        // 3. Transfer Tenant to Room 102
        TenantDto.TransferRequest transferReq = new TenantDto.TransferRequest(
                room2.getId(),
                bed2A.getId(),
                new BigDecimal("18000.00"),
                "Upgraded to single room"
        );
        tenantService.transferRoom(tenant.getId(), transferReq);

        // Old bed should now be AVAILABLE, new bed OCCUPIED
        assertEquals(BedStatus.AVAILABLE, bedRepository.findById(bed1A.getId()).get().getStatus());
        assertEquals(BedStatus.OCCUPIED, bedRepository.findById(bed2A.getId()).get().getStatus());

        // 4. Vacate Tenant
        tenantService.vacateTenant(tenant.getId());
        assertEquals(TenantStatus.VACATED, tenantRepository.findById(tenant.getId()).get().getStatus());
        assertEquals(BedStatus.AVAILABLE, bedRepository.findById(bed2A.getId()).get().getStatus());
    }
}

