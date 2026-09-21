package com.abode.tenancy;

import com.abode.tenancy.domain.enums.*;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.RentDto;
import com.abode.tenancy.service.ReceiptService;
import com.abode.tenancy.service.RentService;
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
public class RentServiceTest {

    @Autowired
    private RentService rentService;

    @Autowired
    private ReceiptService receiptService;

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
    private RentInvoiceRepository rentInvoiceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Property property;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        User owner = userRepository.save(User.builder()
                .fullName("Rent Owner")
                .phone("9777700001")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.OWNER)
                .build());

        property = propertyRepository.save(Property.builder()
                .owner(owner)
                .name("Rent Test PG")
                .slug("rent-test-pg")
                .address("Marathahalli")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560037")
                .contactPhone("9777700001")
                .build());

        Room room = roomRepository.save(Room.builder()
                .property(property)
                .roomNumber("204")
                .sharingType(3)
                .baseRent(new BigDecimal("9500.00"))
                .build());

        Bed bed = bedRepository.save(Bed.builder()
                .room(room)
                .bedLabel("Bed A")
                .status(BedStatus.OCCUPIED)
                .build());

        User tenantUser = userRepository.save(User.builder()
                .fullName("Rahul Tenant")
                .phone("9777700002")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.TENANT)
                .build());

        tenant = tenantRepository.save(Tenant.builder()
                .user(tenantUser)
                .property(property)
                .room(room)
                .bed(bed)
                .joiningDate(LocalDate.now().minusMonths(1))
                .rentAmount(new BigDecimal("9500.00"))
                .status(TenantStatus.ACTIVE)
                .build());
    }

    @Test
    @DisplayName("Rent billing cycle: Generate invoices, record offline payment, and generate receipt PDF")
    void testRentWorkflow() {
        String month = "2026-09";
        LocalDate dueDate = LocalDate.now().plusDays(5);
        RentDto.GenerateInvoicesRequest req = new RentDto.GenerateInvoicesRequest(property.getId(), month, dueDate);

        rentService.generateMonthlyInvoices(req);

        RentDto.DashboardSummary dashboard = rentService.getRentDashboard(property.getId(), month);
        assertEquals(1, dashboard.getInvoices().size());
        assertEquals(new BigDecimal("9500.00"), dashboard.getTotalExpected());
        assertEquals(new BigDecimal("9500.00"), dashboard.getTotalPending());

        RentDto.InvoiceItem inv = dashboard.getInvoices().get(0);
        assertEquals(RentStatus.PENDING, inv.getStatus());

        // Record payment
        RentDto.RecordOfflinePaymentRequest payReq = new RentDto.RecordOfflinePaymentRequest(
                inv.getId(),
                new BigDecimal("9500.00"),
                PaymentMethod.UPI,
                "Paid via Google Pay"
        );
        Payment payment = rentService.recordOfflinePayment(payReq, property.getOwner().getId());
        assertNotNull(payment);
        assertTrue(payment.getReceiptNumber().startsWith("PG-SEP-204-"));

        // Verify PDF receipt generation
        byte[] pdf = receiptService.generateReceiptPdf(payment);
        assertNotNull(pdf);
        assertTrue(pdf.length > 500);

        // Verify dashboard updated
        RentDto.DashboardSummary updatedDash = rentService.getRentDashboard(property.getId(), month);
        assertEquals(0, updatedDash.getTotalCollected().compareTo(new BigDecimal("9500.00")));
        assertEquals(0, updatedDash.getTotalPending().compareTo(BigDecimal.ZERO));
        assertEquals(1, updatedDash.getPaidCount());
    }
}
