package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.PaymentMethod;
import com.abode.tenancy.domain.enums.PaymentStatus;
import com.abode.tenancy.domain.enums.RentStatus;
import com.abode.tenancy.domain.enums.TenantStatus;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.RentDto;
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
public class RentService {

    private final RentInvoiceRepository rentInvoiceRepository;
    private final PaymentRepository paymentRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public void generateMonthlyInvoices(RentDto.GenerateInvoicesRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        List<Tenant> activeTenants = tenantRepository.findByPropertyIdAndStatus(request.getPropertyId(), TenantStatus.ACTIVE);
        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().withDayOfMonth(5);

        for (Tenant tenant : activeTenants) {
            Optional<RentInvoice> existing = rentInvoiceRepository.findByTenantIdAndMonthYear(tenant.getId(), request.getMonthYear());
            if (existing.isEmpty()) {
                String roomNum = tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "000";
                String invNum = "INV-" + request.getMonthYear() + "-" + roomNum + "-" + (int)(Math.random() * 900 + 100);

                RentInvoice invoice = RentInvoice.builder()
                        .property(property)
                        .tenant(tenant)
                        .invoiceNumber(invNum)
                        .monthYear(request.getMonthYear())
                        .amount(tenant.getRentAmount())
                        .discountAmount(BigDecimal.ZERO)
                        .dueDate(dueDate)
                        .status(RentStatus.PENDING)
                        .paidAmount(BigDecimal.ZERO)
                        .build();

                rentInvoiceRepository.save(invoice);

                notificationService.sendNotification(
                        tenant.getUser().getId(),
                        property.getId(),
                        "RENT",
                        "Rent Invoice Generated (" + request.getMonthYear() + ")",
                        "Rent amount of ₹" + invoice.getAmount() + " is due on " + dueDate,
                        "/tenant/rent"
                );
            }
        }

        auditService.log(request.getPropertyId(), null, "GENERATE_INVOICES", "RentInvoice", null,
                "Generated rent invoices for " + request.getMonthYear());
    }

    @Transactional(readOnly = true)
    public RentDto.DashboardSummary getRentDashboard(UUID propertyId, String monthYear) {
        if (monthYear == null || monthYear.trim().isEmpty()) {
            monthYear = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }

        List<RentInvoice> invoices = rentInvoiceRepository.findByPropertyIdAndMonthYear(propertyId, monthYear);
        List<Tenant> activeTenants = tenantRepository.findByPropertyIdAndStatus(propertyId, TenantStatus.ACTIVE);

        BigDecimal totalExpected = BigDecimal.ZERO;
        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal totalPending = BigDecimal.ZERO;
        BigDecimal totalOverdue = BigDecimal.ZERO;

        long paidCount = 0;
        long pendingCount = 0;
        long overdueCount = 0;

        List<RentDto.InvoiceItem> items = new ArrayList<>();

        for (RentInvoice inv : invoices) {
            totalExpected = totalExpected.add(inv.getAmount());
            totalCollected = totalCollected.add(inv.getPaidAmount());

            if (inv.getStatus() == RentStatus.PAID) {
                paidCount++;
            } else if (inv.getStatus() == RentStatus.OVERDUE || (inv.getStatus() == RentStatus.PENDING && inv.getDueDate().isBefore(LocalDate.now()))) {
                overdueCount++;
                totalOverdue = totalOverdue.add(inv.getAmount().subtract(inv.getPaidAmount()));
            } else {
                pendingCount++;
                totalPending = totalPending.add(inv.getAmount().subtract(inv.getPaidAmount()));
            }

            items.add(RentDto.InvoiceItem.builder()
                    .id(inv.getId())
                    .tenantId(inv.getTenant().getId())
                    .tenantName(inv.getTenant().getUser().getFullName())
                    .tenantPhone(inv.getTenant().getUser().getPhone())
                    .roomNumber(inv.getTenant().getRoom() != null ? inv.getTenant().getRoom().getRoomNumber() : "N/A")
                    .bedLabel(inv.getTenant().getBed() != null ? inv.getTenant().getBed().getBedLabel() : "N/A")
                    .invoiceNumber(inv.getInvoiceNumber())
                    .monthYear(inv.getMonthYear())
                    .amount(inv.getAmount())
                    .discountAmount(inv.getDiscountAmount())
                    .dueDate(inv.getDueDate())
                    .status(inv.getStatus())
                    .paidAmount(inv.getPaidAmount())
                    .paidDate(inv.getPaidDate())
                    .build());
        }

        return RentDto.DashboardSummary.builder()
                .monthYear(monthYear)
                .totalExpected(totalExpected)
                .totalCollected(totalCollected)
                .totalPending(totalPending)
                .totalOverdue(totalOverdue)
                .totalTenants(activeTenants.size())
                .paidCount(paidCount)
                .pendingCount(pendingCount)
                .overdueCount(overdueCount)
                .invoices(items)
                .build();
    }

    @Transactional
    public Payment recordOfflinePayment(RentDto.RecordOfflinePaymentRequest request, UUID recordedBy) {
        RentInvoice invoice = rentInvoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        Tenant tenant = invoice.getTenant();
        Property property = invoice.getProperty();

        String roomNum = tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "000";
        String mon = invoice.getMonthYear().substring(5); // "09" -> "SEP"
        String monName = java.time.Month.of(Integer.parseInt(mon)).name().substring(0, 3);
        int seq = (int)(Math.random() * 900 + 100);

        String receiptNum = "PG-" + monName + "-" + roomNum + "-" + seq;
        String payNum = "PAY-" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .invoice(invoice)
                .property(property)
                .tenant(tenant)
                .paymentNumber(payNum)
                .receiptNumber(receiptNum)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.COMPLETED)
                .paidAt(java.time.ZonedDateTime.now())
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);

        invoice.setPaidAmount(invoice.getPaidAmount().add(request.getAmount()));
        if (invoice.getPaidAmount().compareTo(invoice.getAmount()) >= 0) {
            invoice.setStatus(RentStatus.PAID);
            invoice.setPaidDate(LocalDate.now());
        }
        rentInvoiceRepository.save(invoice);

        notificationService.sendNotification(
                tenant.getUser().getId(),
                property.getId(),
                "RENT",
                "Rent Payment Received",
                "Your payment of ₹" + request.getAmount() + " for " + invoice.getMonthYear() + " has been recorded. Receipt: " + receiptNum,
                "/tenant/rent"
        );

        auditService.log(property.getId(), recordedBy, "RECORD_PAYMENT", "Payment", payment.getId().toString(),
                "Recorded offline payment of ₹" + request.getAmount() + " for invoice " + invoice.getInvoiceNumber());

        return payment;
    }

    @Transactional(readOnly = true)
    public RentDto.PaymentReceipt getReceipt(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        return RentDto.PaymentReceipt.builder()
                .paymentId(payment.getId())
                .paymentNumber(payment.getPaymentNumber())
                .receiptNumber(payment.getReceiptNumber())
                .tenantName(payment.getTenant().getUser().getFullName())
                .tenantPhone(payment.getTenant().getUser().getPhone())
                .propertyName(payment.getProperty().getName())
                .propertyAddress(payment.getProperty().getAddress() + ", " + payment.getProperty().getCity())
                .roomNumber(payment.getTenant().getRoom() != null ? payment.getTenant().getRoom().getRoomNumber() : "N/A")
                .bedLabel(payment.getTenant().getBed() != null ? payment.getTenant().getBed().getBedLabel() : "N/A")
                .monthYear(payment.getInvoice().getMonthYear())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .build();
    }

    @Transactional
    public RentInvoice addGuestMealCharge(RentDto.GuestMealChargeRequest request) {
        String currentMonth = String.format("%d-%02d", LocalDate.now().getYear(), LocalDate.now().getMonthValue());
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        RentInvoice invoice = rentInvoiceRepository.findByTenantIdAndMonthYear(request.getTenantId(), currentMonth)
                .orElseGet(() -> {
                    String roomNum = tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : "000";
                    String invNum = "INV-" + currentMonth + "-" + roomNum + "-" + (int)(Math.random() * 900 + 100);
                    return RentInvoice.builder()
                            .property(tenant.getProperty())
                            .tenant(tenant)
                            .invoiceNumber(invNum)
                            .monthYear(currentMonth)
                            .amount(tenant.getRentAmount())
                            .discountAmount(BigDecimal.ZERO)
                            .dueDate(LocalDate.now().withDayOfMonth(5))
                            .status(RentStatus.PENDING)
                            .paidAmount(BigDecimal.ZERO)
                            .build();
                });

        int guests = request.getGuestCount() != null ? request.getGuestCount() : 1;
        BigDecimal price = request.getPricePerMeal() != null ? request.getPricePerMeal() : new BigDecimal("100.00");
        BigDecimal totalSurcharge = price.multiply(BigDecimal.valueOf(guests));

        invoice.setAmount(invoice.getAmount().add(totalSurcharge));
        invoice.setStatus(RentStatus.PENDING);
        rentInvoiceRepository.save(invoice);

        notificationService.sendNotification(
                tenant.getUser().getId(),
                tenant.getProperty().getId(),
                "FOOD",
                "Guest Meal Added to Bill",
                "Added ₹" + totalSurcharge + " (" + guests + " guest(s) for " + request.getMealType() + ") to your " + currentMonth + " invoice.",
                "/tenant/rent"
        );

        auditService.log(tenant.getProperty().getId(), null, "GUEST_MEAL", "RentInvoice", invoice.getId().toString(),
                "Added guest meal surcharge of ₹" + totalSurcharge + " for tenant " + tenant.getUser().getFullName());

        return invoice;
    }
}
