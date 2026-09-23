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
    private final FoodWasteEntryRepository foodWasteEntryRepository;
    private final RentInvoiceRepository rentInvoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final AnnouncementRepository announcementRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByPhone("9876543210") && userRepository.existsByPhone("9845011223")) {
            log.info("Database already seeded with demo data.");
            return;
        }

        log.info("Starting Abode Tenancy comprehensive SaaS demo data seeding...");

        // 1. Create Primary Owner (Supports both 9876543210 and 9845011223)
        User owner1 = User.builder()
                .fullName("Harish Kumar (Property Owner)")
                .phone("9876543210")
                .email("harish@srisaipg.com")
                .passwordHash(passwordEncoder.encode("Owner@123"))
                .role(Role.OWNER)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .build();
        owner1 = userRepository.save(owner1);

        User owner2 = User.builder()
                .fullName("Harish Kumar (HQ Admin)")
                .phone("9845011223")
                .email("owner@srisaipg.com")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(Role.OWNER)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                .build();
        owner2 = userRepository.save(owner2);

        // 2. Create Cooks
        User cook1 = User.builder()
                .fullName("Ramesh Cook (Head Chef)")
                .phone("9876543211")
                .email("ramesh.cook@srisaipg.com")
                .passwordHash(passwordEncoder.encode("Cook@123"))
                .role(Role.COOK)
                .status(UserStatus.ACTIVE)
                .languagePreference("te")
                .avatarUrl("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150")
                .build();
        cook1 = userRepository.save(cook1);

        User cook2 = User.builder()
                .fullName("Shankar Cook (Sous Chef)")
                .phone("9845011225")
                .email("cook@srisaipg.com")
                .passwordHash(passwordEncoder.encode("Cook@123"))
                .role(Role.COOK)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150")
                .build();
        cook2 = userRepository.save(cook2);

        // 3. Create Primary Property: Sri Sai PG for Men
        Property property = Property.builder()
                .owner(owner1)
                .name("Sri Sai PG for Men")
                .slug("sri-sai-pg-marathahalli")
                .address("#42, 3rd Cross, AECS Layout, Marathahalli")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560037")
                .genderAllowed("MEN")
                .contactPhone("9876543210")
                .contactEmail("contact@srisaipg.com")
                .description("Premium Luxury PG for Men located in the heart of Marathahalli with high-speed 300 Mbps Wi-Fi, 3 times hygienic homely food, daily housekeeping, 24/7 solar hot water, and keycard security.")
                .rules("1. Visitors allowed in lobby until 9:00 PM.\n2. No smoking or alcohol in PG premises.\n3. Dinner served between 7:30 PM - 9:30 PM.\n4. 30 days notice period required before vacating.")
                .noticePeriodDays(30)
                .defaultDeposit(new BigDecimal("10000.00"))
                .referralReward(new BigDecimal("500.00"))
                .build();

        // Add facilities
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("High-Speed Wi-Fi (300 Mbps)").icon("Wifi").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("3x Hygienic Homely Food").icon("Utensils").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Daily Room Cleaning").icon("Sparkles").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Automatic Washing Machines").icon("Shirt").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("24/7 Hot Water (Solar & Geyser)").icon("Flame").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Power Backup (Silent Gen)").icon("Zap").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("CCTV & Security Guard").icon("ShieldCheck").isAvailable(true).build());
        property.getFacilities().add(PropertyFacility.builder().property(property).facilityName("Covered Two-Wheeler Parking").icon("Bike").isAvailable(true).build());

        // Add Pricing tiers
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(1).monthlyRent(new BigDecimal("18000.00")).depositAmount(new BigDecimal("20000.00")).description("Private Room with Attached Bath & Balcony").build());
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(2).monthlyRent(new BigDecimal("12000.00")).depositAmount(new BigDecimal("15000.00")).description("Spacious 2-Sharing with Attached Bathroom").build());
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(3).monthlyRent(new BigDecimal("9500.00")).depositAmount(new BigDecimal("10000.00")).description("Budget Friendly 3-Sharing Room").build());
        property.getPricing().add(PropertyPricing.builder().property(property).sharingType(4).monthlyRent(new BigDecimal("8000.00")).depositAmount(new BigDecimal("10000.00")).description("Standard 4-Sharing Room").build());

        // Add FAQs
        property.getFaqs().add(PropertyFaq.builder().property(property).question("Is 3 times food included in the monthly rent?").answer("Yes, breakfast, lunch, and dinner with South & North Indian varieties are included.").sortOrder(1).build());
        property.getFaqs().add(PropertyFaq.builder().property(property).question("What is the security deposit and refund policy?").answer("Security deposit is equal to one month rent and is refundable upon 30-day notice.").sortOrder(2).build());
        property.getFaqs().add(PropertyFaq.builder().property(property).question("Are visitors allowed?").answer("Visitors are allowed in the common reception lounge until 9:00 PM.").sortOrder(3).build());

        // Add Photos
        property.getPhotos().add(PropertyPhoto.builder().property(property).category("EXTERIOR").photoUrl("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800").caption("Building Exterior").sortOrder(1).build());
        property.getPhotos().add(PropertyPhoto.builder().property(property).category("ROOM").photoUrl("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800").caption("Spacious 2-Sharing Room").sortOrder(2).build());
        property.getPhotos().add(PropertyPhoto.builder().property(property).category("DINING").photoUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800").caption("Clean Dining Hall").sortOrder(3).build());

        property = propertyRepository.save(property);

        // Staff mappings for both cooks
        StaffMember cookStaff1 = StaffMember.builder()
                .property(property)
                .user(cook1)
                .designation("Head Cook")
                .permissionsJson("[\"VIEW_MEAL_COUNTS\", \"UPDATE_MEAL_STATUS\", \"VIEW_MENU\", \"RECORD_WASTE\"]")
                .isActive(true)
                .build();
        staffMemberRepository.save(cookStaff1);

        StaffMember cookStaff2 = StaffMember.builder()
                .property(property)
                .user(cook2)
                .designation("Head Cook")
                .permissionsJson("[\"VIEW_MEAL_COUNTS\", \"UPDATE_MEAL_STATUS\", \"VIEW_MENU\", \"RECORD_WASTE\"]")
                .isActive(true)
                .build();
        staffMemberRepository.save(cookStaff2);

        // 4. Create Rooms and Beds across 3 Floors
        List<Room> createdRooms = new ArrayList<>();
        int[] roomNumbers = {101, 102, 103, 104, 105, 106, 201, 202, 203, 204, 205, 206, 301, 302, 303, 304, 305, 306};

        for (int rNum : roomNumbers) {
            int floor = rNum / 100;
            int sharing = (rNum % 3 == 0) ? 2 : (rNum % 2 == 0) ? 3 : 4;
            if (rNum == 101 || rNum == 301) sharing = 1;

            BigDecimal rent = sharing == 1 ? new BigDecimal("18000.00") :
                              sharing == 2 ? new BigDecimal("12000.00") :
                              sharing == 3 ? new BigDecimal("9500.00") : new BigDecimal("8000.00");

            boolean isAc = (rNum % 2 == 1);
            boolean hasBalcony = (rNum % 3 == 0);
            boolean isCleaned = (rNum != 104 && rNum != 205 && rNum != 303);

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
                    .lastCleanedAt(isCleaned ? ZonedDateTime.now().minusHours(2) : null)
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

        // 5. Create Primary Demo Tenants
        // Tenant 1: Rahul Kumar (Room 204, Bed A) - Accessible via 9876543212 and 9845011224
        User rahulUser1 = User.builder()
                .fullName("Rahul Kumar")
                .phone("9876543212")
                .email("rahul.k@gmail.com")
                .passwordHash(passwordEncoder.encode("Tenant@123"))
                .role(Role.TENANT)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                .build();
        rahulUser1 = userRepository.save(rahulUser1);

        User rahulUser2 = User.builder()
                .fullName("Rahul Kumar (Resident)")
                .phone("9845011224")
                .email("tenant@srisaipg.com")
                .passwordHash(passwordEncoder.encode("Tenant@123"))
                .role(Role.TENANT)
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                .build();
        rahulUser2 = userRepository.save(rahulUser2);

        Room room204 = createdRooms.stream().filter(r -> r.getRoomNumber().equals("204")).findFirst().get();
        Bed bed204A = room204.getBeds().get(0);
        bed204A.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed204A);

        Tenant rahulTenant = Tenant.builder()
                .user(rahulUser1)
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

        Room room205 = createdRooms.stream().filter(r -> r.getRoomNumber().equals("205")).findFirst().get();
        Bed bed205A = room205.getBeds().get(0);
        bed205A.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed205A);

        Tenant rahulTenant2 = Tenant.builder()
                .user(rahulUser2)
                .property(property)
                .room(room205)
                .bed(bed205A)
                .joiningDate(LocalDate.now().minusMonths(6))
                .rentAmount(new BigDecimal("9500.00"))
                .depositAmount(new BigDecimal("10000.00"))
                .emergencyContactName("Sunil Kumar (Father)")
                .emergencyContactPhone("9811223344")
                .status(TenantStatus.ACTIVE)
                .build();
        rahulTenant2 = tenantRepository.save(rahulTenant2);
        room205.setStatus(RoomStatus.PARTIALLY_OCCUPIED);
        roomRepository.save(room205);

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

        MealPreference rahulPref2 = MealPreference.builder()
                .tenant(rahulTenant2)
                .weekdayBreakfast(false)
                .weekdayLunch(true)
                .weekdayDinner(true)
                .weekendBreakfast(true)
                .weekendLunch(true)
                .weekendDinner(true)
                .build();
        mealPreferenceRepository.save(rahulPref2);

        // Tenant 2: Kiran Reddy (Room 204, Bed B - On Notice Period)
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
                .vacatingDate(LocalDate.now().plusDays(12))
                .rentAmount(new BigDecimal("9500.00"))
                .depositAmount(new BigDecimal("10000.00"))
                .emergencyContactName("Venkatesh Reddy (Brother)")
                .emergencyContactPhone("9844556677")
                .status(TenantStatus.ON_NOTICE)
                .build();
        kiranTenant = tenantRepository.save(kiranTenant);

        room204.setStatus(RoomStatus.PARTIALLY_OCCUPIED);
        roomRepository.save(room204);

        // Populate additional tenants to reach realistic ~38 occupied beds & active roster
        int tenantCount = 3;
        String[] sampleNames = {"Ajay Sharma", "Vikram Singh", "Suresh Nair", "Manoj Gupta", "Anand Rao",
                "Deepak Patel", "Rohan Mehta", "Gautam Verma", "Siddharth Das", "Pradeep Joshi",
                "Arjun Nair", "Karthik Iyer", "Varun Teja", "Naveen Babu", "Rakesh Goud", "Manish Tiwari",
                "Praveen Reddy", "Sanjay Hegde", "Vivek Menon", "Abhishek Sen"};

        for (Room r : createdRooms) {
            if (r.getRoomNumber().equals("204") || r.getRoomNumber().equals("205")) continue;

            // Keep room 101, 202, 306 vacant for walk-ins & live UI allocation tests
            int toOccupy = (r.getRoomNumber().equals("101") || r.getRoomNumber().equals("202") || r.getRoomNumber().equals("306")) ? 0 : r.getBeds().size();

            for (int b = 0; b < toOccupy; b++) {
                Bed currentBed = r.getBeds().get(b);
                currentBed.setStatus(BedStatus.OCCUPIED);
                bedRepository.save(currentBed);

                String name = sampleNames[tenantCount % sampleNames.length];
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
                        .joiningDate(LocalDate.now().minusMonths(tenantCount % 10 + 1))
                        .rentAmount(r.getBaseRent())
                        .depositAmount(new BigDecimal("10000.00"))
                        .emergencyContactName("Guardian (" + name.split(" ")[0] + ")")
                        .emergencyContactPhone("989900" + String.format("%04d", tenantCount))
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

        // 6. Create Rotating Weekly Menus (Today, Yesterday, Tomorrow)
        LocalDate today = LocalDate.now();
        for (int i = -2; i <= 4; i++) {
            LocalDate mDate = today.plusDays(i);
            int dayOfWeek = mDate.getDayOfWeek().getValue();

            String bItems = dayOfWeek == 7 ? "Masala Dosa, Sambar, Coconut & Tomato Chutney, Filter Coffee" :
                            dayOfWeek == 6 ? "Puri Bhaji, Kesari Bath, Tea / Coffee" :
                            dayOfWeek == 3 ? "Aloo Paratha with Curd, Pickle, Tea / Coffee" :
                            "Idli, Medu Vada, Sambar, Coconut Chutney, Tea / Coffee";

            String lItems = dayOfWeek == 7 ? "Chicken Biryani / Paneer Biryani, Mirchi Ka Salan, Raita, Gulab Jamun" :
                            dayOfWeek == 3 ? "Steamed Sona Masoori Rice, Dal Makhani, Bhindi Fry, Curd, Papad" :
                            "Steamed Rice, Dal Tadka, Aloo Gobi Masala, Curd, Roasted Papad";

            String dItems = dayOfWeek == 7 ? "Hot Phulkas, Egg Curry / Paneer Butter Masala, Jeera Rice, Salad" :
                            dayOfWeek == 5 ? "Phulka Rotis, Mix Veg Kurma, Veg Pulao, Dal Fry, Raita" :
                            "Phulka Rotis (Unlimited), Paneer Butter Masala, Jeera Rice, Dal Fry, Salad";

            Menu menu = Menu.builder()
                    .property(property)
                    .menuDate(mDate)
                    .breakfastItems(bItems)
                    .breakfastStart("08:00")
                    .breakfastEnd("10:00")
                    .lunchItems(lItems)
                    .lunchStart("12:30")
                    .lunchEnd("14:30")
                    .dinnerItems(dItems)
                    .dinnerStart("19:30")
                    .dinnerEnd("21:30")
                    .isPublished(true)
                    .build();
            menuRepository.save(menu);
        }

        // Meal preparation states for today
        mealPrepStatusRepository.save(MealPrepStatus.builder().property(property).date(today).mealType(MealType.BREAKFAST).status(MealPrepState.COMPLETED).preparedCount(36).build());
        mealPrepStatusRepository.save(MealPrepStatus.builder().property(property).date(today).mealType(MealType.LUNCH).status(MealPrepState.READY).preparedCount(34).build());
        mealPrepStatusRepository.save(MealPrepStatus.builder().property(property).date(today).mealType(MealType.DINNER).status(MealPrepState.IN_PREPARATION).preparedCount(38).build());

        // Food waste log entry for previous day
        foodWasteEntryRepository.save(FoodWasteEntry.builder()
                .property(property)
                .date(today.minusDays(1))
                .mealType(MealType.LUNCH)
                .leftoverKg(new BigDecimal("0.8"))
                .enteredBy(cook1)
                .reason("Rice finished completely. ~0.8kg dal left over.")
                .build());

        // Meal Confirmations for Rahul
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant).property(property).date(today).mealType(MealType.BREAKFAST).isAttending(true).build());
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant).property(property).date(today).mealType(MealType.LUNCH).isAttending(false).build());
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant).property(property).date(today).mealType(MealType.DINNER).isAttending(true).build());

        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant2).property(property).date(today).mealType(MealType.BREAKFAST).isAttending(true).build());
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant2).property(property).date(today).mealType(MealType.LUNCH).isAttending(true).build());
        mealConfirmationRepository.save(MealConfirmation.builder().tenant(rahulTenant2).property(property).date(today).mealType(MealType.DINNER).isAttending(true).build());

        // 7. Create Invoices and Ledger Payments
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
                .paidDate(today.minusDays(8))
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
                .paidAt(ZonedDateTime.now().minusDays(8))
                .build();
        paymentRepository.save(rahulPayment);

        RentInvoice rahul2Invoice = RentInvoice.builder()
                .property(property)
                .tenant(rahulTenant2)
                .invoiceNumber("INV-" + curMonthStr + "-205-01")
                .monthYear(curMonthStr)
                .amount(new BigDecimal("9500.00"))
                .dueDate(today.withDayOfMonth(5))
                .status(RentStatus.PAID)
                .paidAmount(new BigDecimal("9500.00"))
                .paidDate(today.minusDays(5))
                .build();
        rentInvoiceRepository.save(rahul2Invoice);

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

        // 8. Create Realistic Maintenance Tickets & SLA Actions
        Complaint complaint1 = Complaint.builder()
                .property(property)
                .tenant(rahulTenant)
                .room(room204)
                .category(ComplaintCategory.PLUMBING)
                .title("Bathroom washbasin tap leaking")
                .description("The main washbasin tap in room 204 bathroom does not turn off completely and is dripping water.")
                .priority(ComplaintPriority.HIGH)
                .status(ComplaintStatus.IN_PROGRESS)
                .assignedTo("Mohan (Plumber)")
                .resolutionNotes("Mohan plumber notified via WhatsApp dispatch, visiting today at 3:30 PM.")
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
                .assignedTo("ACT Fibernet ISP Support")
                .resolutionNotes("Mesh extender reboot scheduled.")
                .build();
        complaintRepository.save(complaint2);

        Complaint complaint3 = Complaint.builder()
                .property(property)
                .tenant(rahulTenant)
                .room(room204)
                .category(ComplaintCategory.ELECTRICITY)
                .title("Geyser switch indicator light flickering")
                .description("The power switch for geyser in bathroom 204 is loose.")
                .priority(ComplaintPriority.LOW)
                .status(ComplaintStatus.RESOLVED)
                .assignedTo("Ramesh (Electrician)")
                .resolutionNotes("Switch replaced with new 16A Anchor switch. Tested working.")
                .build();
        complaintRepository.save(complaint3);

        // 9. Inbound QR Visitor Applications
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
                .email("ganesh.h@pes.edu")
                .age(22)
                .occupation("Graduate Student")
                .companyOrCollege("PES University")
                .preferredSharing(3)
                .expectedJoiningDate(today.plusDays(4))
                .status(ApplicationStatus.PENDING)
                .build());

        applicationRepository.save(TenantApplication.builder()
                .property(property)
                .name("Sneha Rao")
                .phone("9844112233")
                .email("sneha.rao@infosys.com")
                .age(25)
                .occupation("Senior Analyst")
                .companyOrCollege("Infosys Electronic City")
                .preferredSharing(1)
                .expectedJoiningDate(today.plusDays(10))
                .status(ApplicationStatus.APPROVED)
                .build());

        // 10. Broadcast Announcements
        announcementRepository.save(Announcement.builder()
                .property(property)
                .title("Water Overhead Tank Cleaning Scheduled Tomorrow")
                .message("Please note that water supply will be paused tomorrow from 10:00 AM to 12:00 PM for overhead tank cleaning.")
                .targetAudience("ALL")
                .isPinned(true)
                .build());

        announcementRepository.save(Announcement.builder()
                .property(property)
                .title("Sunday Special Biryani & Sweet Feast")
                .message("Special lunch this Sunday: Chicken Dum Biryani / Paneer Makhani Biryani with Gulab Jamun served 12:30 - 2:30 PM.")
                .targetAudience("ALL")
                .isPinned(false)
                .build());

        log.info("Comprehensive Abode Tenancy SaaS demo data seeding completed successfully! Sri Sai PG initialized.");
    }
}
