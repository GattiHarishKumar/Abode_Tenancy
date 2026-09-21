package com.abode.tenancy.config;

import com.abode.tenancy.domain.enums.*;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final TenantRepository tenantRepository;
    private final TenantApplicationRepository applicationRepository;
    private final MenuRepository menuRepository;
    private final MealConfirmationRepository mealConfirmationRepository;
    private final MealPrepStatusRepository mealPrepStatusRepository;
    private final MealPreferenceRepository mealPreferenceRepository;
    private final RentInvoiceRepository rentInvoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final AnnouncementRepository announcementRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByPhone("9876543210")) {
            log.info("Database already seeded with demo data.");
            return;
        }

        log.info("Starting Abode Tenancy demo data seeding...");

        // 1. Create Super Admin & Owner
        User owner = User.builder()
                .fullName("Harish Kumar")
                .phone("9876543210")
                .email("harish@srisaipg.com")
                .passwordHash(passwordEncoder.encode("Owner@123"))
                .role(Role.OWNER)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .build();
        owner = userRepository.save(owner);

        // 2. Create Cook
        User cook = User.builder()
                .fullName("Ramesh Cook")
                .phone("9876543211")
                .email("ramesh.cook@srisaipg.com")
                .passwordHash(passwordEncoder.encode("Cook@123"))
                .role(Role.COOK)
                .status(UserStatus.ACTIVE)
                .languagePreference("te")
                .avatarUrl("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150")
                .build();
        cook = userRepository.save(cook);

        // 3. Create Primary Property: Sri Sai PG
        Property property = Property.builder()
                .owner(owner)
                .name("Sri Sai PG for Men")
                .slug("sri-sai-pg-marathahalli")
                .address("#42, 3rd Cross, AECS Layout, Marathahalli")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560037")
                .genderAllowed("MEN")
                .contactPhone("9876543210")
                .contactEmail("contact@srisaipg.com")
                .description("Premium Luxury PG for Men located in the heart of Marathahalli with high-speed Wi-Fi, 3 times hygienic food, daily housekeeping, and 24/7 security.")
                .rules("1. Visitors allowed in lobby until 9:00 PM.\n2. No smoking or alcohol in PG premises.\n3. Dinner served between 7:30 PM - 9:30 PM.\n4. 30 days notice period required before vacating.")
                .noticePeriodDays(30)
                .defaultDeposit(new BigDecimal("10000.00"))
                .referralReward(new BigDecimal("500.00"))
                .build();

        // Add facilities
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("High-Speed Wi-Fi").icon("Wifi").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("3x Hygienic Food").icon("Utensils").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Daily Housekeeping").icon("Sparkles").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Automatic Washing Machines").icon("Shirt").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("24/7 Hot Water (Solar & Geyser)").icon("Flame").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Power Backup").icon("Zap").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("CCTV & Security Guard").icon("ShieldCheck").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Two Wheeler Parking").icon("Bike").isAvailable(true).build());

        // Add Pricing
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(1).monthlyRent(new BigDecimal("18000.00")).depositAmount(new BigDecimal("20000.00")).description("Private Room with Attached Bath & Balcony").build());
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(2).monthlyRent(new BigDecimal("12000.00")).depositAmount(new BigDecimal("15000.00")).description("Spacious 2-Sharing with Attached Bathroom").build());
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(3).monthlyRent(new BigDecimal("9500.00")).depositAmount(new BigDecimal("10000.00")).description("Budget Friendly 3-Sharing Room").build());
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(4).monthlyRent(new BigDecimal("8000.00")).depositAmount(new BigDecimal("10000.00")).description("Standard 4-Sharing Room").build());

        // Add FAQs
        property.getFaqs().add(PropertyFaq.builder().property(property).question("Is 3 times food included in the monthly rent?").answer("Yes, breakfast, lunch, and dinner with veg and non-veg options are included.").sortOrder(1).build());
        property.getFaqs().add(PropertyFaq.builder().property(property).question("What is the security deposit and refund policy?").answer("Security deposit is equal to one month rent and is refundable upon 30-day notice.").sortOrder(2).build());
        property.getFaqs().add(PropertyFaq.builder().property(property).question("Are visitors allowed?").answer("Visitors are allowed in the common reception lounge until 9:00 PM.").sortOrder(3).build());

        // Add Photos
        property.getPhotos().add(PropertyPhoto.builder().property(property).category("EXTERIOR").photoUrl("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800").caption("Building Exterior").sortOrder(1).build());
        property.getPhotos().add(PropertyPhoto.builder().property(property).category("ROOM").photoUrl("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800").caption("Spacious 2-Sharing Room").sortOrder(2).build());
        property.getPhotos().add(PropertyPhoto.builder().property(property).category("DINING").photoUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800").caption("Clean Dining Hall").sortOrder(3).build());

        property = propertyRepository.save(property);

        // Link Cook as Staff
        StaffMember cookStaff = StaffMember.builder()
                .property(property)
                .user(cook)
                .designation("Head Cook")
                .permissionsJson("[\"VIEW_MEAL_COUNTS\", \"UPDATE_MEAL_STATUS\", \"VIEW_MENU\", \"RECORD_WASTE\"]")
                .isActive(true)
                .build();
        staffMemberRepository.save(cookStaff);

        // 4. Create Rooms and Beds
        // Floor 1 (101-106)
        // Floor 2 (201-206)
        // Floor 3 (301-306)
        List<Room> createdRooms = new ArrayList<>();
        int[] roomNumbers = {101, 102, 103, 104, 105, 106, 201, 202, 203, 204, 205, 206, 301, 302, 303, 304, 305, 306};

        for (int rNum : roomNumbers) {
            int floor = rNum / 100;
            int sharing = (rNum % 3 == 0) ? 2 : (rNum % 2 == 0) ? 3 : 4;
            BigDecimal rent = sharing == 2 ? new BigDecimal("12000.00") : sharing == 3 ? new BigDecimal("9500.00") : new BigDecimal("8000.00");
            boolean isAc = (rNum % 2 == 1);
            boolean hasBalcony = (rNum % 3 == 0);
            boolean isCleaned = (rNum != 104 && rNum != 205);

            Room room = Room.builder()
                    .property(property)
                    .roomNumber(String.valueOf(rNum))
                    .floorNumber(floor)
                    .sharingType(sharing)
                    .baseRent(rent)
                    .isAc(isAc)
                    .hasBalcony(hasBalcony)
                    .hasAttachedWashroom(true)
                    .isCleanedToday(isCleaned)
                    .lastCleanedAt(isCleaned ? java.time.ZonedDateTime.now().minusHours(2) : null)
                    .status(RoomStatus.AVAILABLE)
                    .build();
            room = roomRepository.save(room);

            char bedChar = 'A';
            for (int b = 0; b < sharing; b++) {
                Bed bed = Bed.builder()
                        .room(room)
                        .bedLabel("Bed " + (char)(bedChar + b))
                        .status(BedStatus.AVAILABLE)
                        .build();
                bedRepository.save(bed);
                room.getBeds().add(bed);
            }
            createdRooms.add(room);
        }

        // 5. Create Key Demo Tenants
        // Tenant 1: Rahul Kumar (Room 204, Bed A, Rent Paid)
        User rahulUser = User.builder()
                .fullName("Rahul Kumar")
                .phone("9876543212")
                .email("rahul.k@gmail.com")
                .passwordHash(passwordEncoder.encode("Tenant@123"))
                .role(Role.TENANT)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                .build();
        rahulUser = userRepository.save(rahulUser);

        Room room204 = createdRooms.stream().filter(r -> r.getRoomNumber().equals("204")).findFirst().get();
        Bed bed204A = room204.getBeds().get(0);
        bed204A.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed204A);

        Tenant rahulTenant = Tenant.builder()
                .user(rahulUser)
                .property(property)
                .room(room204)
                .bed(bed204A)
                .joiningDate(LocalDate.now().minusMonths(6))
                .rentAmount(new BigDecimal("9500.00"))
                .depositAmount(new BigDecimal("10000.00"))
                .emergencyContactName("Sunil Kumar (Father)")
                .emergencyContactPhone("9811223344")
                .status(TenantStatus.ACTIVE)
                .build();
        rahulTenant = tenantRepository.save(rahulTenant);

        MealPreference rahulPref = MealPreference.builder()
                .tenant(rahulTenant)
                .weekdayBreakfast(false)
                .weekdayLunch(true)
                .weekdayDinner(true)
                .weekendBreakfast(true)
                .weekendLunch(true)
                .weekendDinner(true)
                .build();
        mealPreferenceRepository.save(rahulPref);

        // Tenant 2: Kiran Reddy (Room 204, Bed B, Rent Pending)
        User kiranUser = User.builder()
                .fullName("Kiran Reddy")
                .phone("9876543213")
                .email("kiran.reddy@gmail.com")
                .passwordHash(passwordEncoder.encode("Tenant@123"))
                .role(Role.TENANT)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150")
                .build();
        kiranUser = userRepository.save(kiranUser);

        Bed bed204B = room204.getBeds().get(1);
        bed204B.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed204B);

        Tenant kiranTenant = Tenant.builder()
                .user(kiranUser)
                .property(property)
                .room(room204)
                .bed(bed204B)
                .joiningDate(LocalDate.now().minusMonths(2))
                .vacatingDate(LocalDate.now().plusDays(8))
                .rentAmount(new BigDecimal("9500.00"))
                .depositAmount(new BigDecimal("10000.00"))
                .emergencyContactName("Venkatesh Reddy (Brother)")
                .emergencyContactPhone("9844556677")
                .status(TenantStatus.ON_NOTICE)
                .build();
        kiranTenant = tenantRepository.save(kiranTenant);

        room204.setStatus(RoomStatus.PARTIALLY_OCCUPIED);
        roomRepository.save(room204);

        // Populate additional tenants to reach realistic ~42 occupied rooms & ~86 tenants
        int tenantCount = 3;
        String[] sampleNames = {"Ajay Sharma", "Vikram Singh", "Suresh Nair", "Manoj Gupta", "Anand Rao",
                "Deepak Patel", "Rohan Mehta", "Gautam Verma", "Siddharth Das", "Pradeep Joshi",
                "Arjun Nair", "Karthik Iyer", "Varun Teja", "Naveen Babu", "Rakesh Goud", "Manish Tiwari"};

        for (Room r : createdRooms) {
            if (r.getRoomNumber().equals("204")) continue;

            int toOccupy = r.getRoomNumber().equals("101") || r.getRoomNumber().equals("202") || r.getRoomNumber().equals("306") ? 0 : r.getBeds().size();
            for (int b = 0; b < toOccupy; b++) {
                Bed currentBed = r.getBeds().get(b);
                currentBed.setStatus(BedStatus.OCCUPIED);
                bedRepository.save(currentBed);

                String name = sampleNames[tenantCount % sampleNames.length] + " " + tenantCount;
                String phone = String.format("981100%04d", tenantCount);

                User tUser = User.builder()
                        .fullName(name)
                        .phone(phone)
                        .email("tenant" + tenantCount + "@example.com")
                        .passwordHash(passwordEncoder.encode("Tenant@123"))
                        .role(Role.TENANT)
                        .status(UserStatus.ACTIVE)
                        .build();
                tUser = userRepository.save(tUser);

                Tenant t = Tenant.builder()
                        .user(tUser)
                        .property(property)
                        .room(r)
                        .bed(currentBed)
                        .joiningDate(LocalDate.now().minusMonths(tenantCount % 12 + 1))
                        .rentAmount(r.getBaseRent())
                        .depositAmount(new BigDecimal("10000.00"))
                        .status(TenantStatus.ACTIVE)
                        .build();
                t = tenantRepository.save(t);
                tenantCount++;
            }

            if (toOccupy == 0) r.setStatus(RoomStatus.AVAILABLE);
            else if (toOccupy == r.getBeds().size()) r.setStatus(RoomStatus.FULL);
            else r.setStatus(RoomStatus.PARTIALLY_OCCUPIED);
            roomRepository.save(r);
        }

        // 6. Create Menu for Today & Tomorrow
        LocalDate today = LocalDate.now();
        Menu todayMenu = Menu.builder()
                .property(property)
                .menuDate(today)
                .breakfastItems("Idli, Medu Vada, Sambar, Coconut Chutney, Tea / Coffee")
                .breakfastStart("08:00")
                .breakfastEnd("10:00")
                .lunchItems("Steamed Rice, Dal Tadka, Aloo Gobi Masala, Curd, Roasted Papad")
                .lunchStart("12:30")
                .lunchEnd("14:30")
                .dinnerItems("Phulka Rotis (unlimited), Paneer Butter Masala, Jeera Rice, Dal Fry, Salad")
                .dinnerStart("19:30")
                .dinnerEnd("21:30")
                .isPublished(true)
                .build();
        menuRepository.save(todayMenu);

        // Prep status for today
        mealPrepStatusRepository.save(MealPrepStatus.builder().property(property).date(today).mealType(MealType.BREAKFAST).status(MealPrepState.COMPLETED).preparedCount(62).build());
        mealPrepStatusRepository.save(MealPrepStatus.builder().property(property).date(today).mealType(MealType.LUNCH).status(MealPrepState.READY).preparedCount(71).build());
        mealPrepStatusRepository.save(MealPrepStatus.builder().property(property).date(today).mealType(MealType.DINNER).status(MealPrepState.IN_PREPARATION).preparedCount(66).build());

        // Meal Confirmations for Rahul
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant).property(property).date(today).mealType(MealType.BREAKFAST).isAttending(true).build());
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant).property(property).date(today).mealType(MealType.LUNCH).isAttending(false).build());
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant).property(property).date(today).mealType(MealType.DINNER).isAttending(true).build());

        // 7. Create Invoices and Payments for Current Month
        String curMonthStr = String.format("%d-%02d", today.getYear(), today.getMonthValue());
        RentInvoice rahulInvoice = RentInvoice.builder()
                .property(property)
                .tenant(rahulTenant)
                .invoiceNumber("INV-" + curMonthStr + "-204-01")
                .monthYear(curMonthStr)
                .amount(new BigDecimal("9500.00"))
                .dueDate(today.withDayOfMonth(5))
                .status(RentStatus.PAID)
                .paidAmount(new BigDecimal("9500.00"))
                .paidDate(today.minusDays(10))
                .build();
        rahulInvoice = rentInvoiceRepository.save(rahulInvoice);

        Payment rahulPayment = Payment.builder()
                .invoice(rahulInvoice)
                .property(property)
                .tenant(rahulTenant)
                .paymentNumber("PAY-2026-SEP-001")
                .receiptNumber("PG-SEP-204-001")
                .amount(new BigDecimal("9500.00"))
                .paymentMethod(PaymentMethod.UPI)
                .status(PaymentStatus.COMPLETED)
                .paidAt(ZonedDateTime.now().minusDays(10))
                .build();
        paymentRepository.save(rahulPayment);

        RentInvoice kiranInvoice = RentInvoice.builder()
                .property(property)
                .tenant(kiranTenant)
                .invoiceNumber("INV-" + curMonthStr + "-204-02")
                .monthYear(curMonthStr)
                .amount(new BigDecimal("9500.00"))
                .dueDate(today.withDayOfMonth(5))
                .status(RentStatus.PENDING)
                .paidAmount(BigDecimal.ZERO)
                .build();
        rentInvoiceRepository.save(kiranInvoice);

        // 8. Create Realistic Complaints
        Complaint complaint1 = Complaint.builder()
                .property(property)
                .tenant(rahulTenant)
                .room(room204)
                .category(ComplaintCategory.PLUMBING)
                .title("Bathroom tap is leaking continuously")
                .description("The main washbasin tap in room 204 bathroom does not turn off completely and is dripping water.")
                .priority(ComplaintPriority.HIGH)
                .status(ComplaintStatus.IN_PROGRESS)
                .assignedTo("Mohan Plumber")
                .resolutionNotes("Plumber has been called, scheduled to visit today at 3 PM.")
                .build();
        complaintRepository.save(complaint1);

        Complaint complaint2 = Complaint.builder()
                .property(property)
                .tenant(kiranTenant)
                .room(room204)
                .category(ComplaintCategory.WIFI)
                .title("Wi-Fi signal weak in corner bed")
                .description("Internet disconnects frequently during video calls in Bed B.")
                .priority(ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.ACKNOWLEDGED)
                .build();
        complaintRepository.save(complaint2);

        // 9. Create Join Applications
        applicationRepository.save(TenantApplication.builder()
                .property(property)
                .name("Aditya Verma")
                .phone("9822334455")
                .email("aditya.verma@wipro.com")
                .age(24)
                .occupation("Software Engineer")
                .companyOrCollege("Wipro Technologies")
                .preferredSharing(2)
                .expectedJoiningDate(today.plusDays(7))
                .status(ApplicationStatus.PENDING)
                .notes("Looking for room near Outer Ring Road with good Wi-Fi.")
                .build());

        applicationRepository.save(TenantApplication.builder()
                .property(property)
                .name("Ganesh Hegde")
                .phone("9833445566")
                .age(22)
                .occupation("Graduate Student")
                .companyOrCollege("PES University")
                .preferredSharing(3)
                .expectedJoiningDate(today.plusDays(4))
                .status(ApplicationStatus.PENDING)
                .build());

        // 10. Create Announcements
        announcementRepository.save(Announcement.builder()
                .property(property)
                .title("Water Overhead Tank Cleaning Scheduled Tomorrow")
                .message("Please note that water supply will be paused tomorrow from 10:00 AM to 12:00 PM for overhead tank cleaning.")
                .targetAudience("ALL")
                .isPinned(true)
                .build());

        log.info("Demo data seeding completed successfully! Sri Sai PG initialized with rooms, tenants, meals, complaints & invoices.");
    }
}
