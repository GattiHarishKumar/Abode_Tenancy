package com.abode.tenancy.dto;

import com.abode.tenancy.domain.enums.PaymentMethod;
import com.abode.tenancy.domain.enums.PaymentStatus;
import com.abode.tenancy.domain.enums.RentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class RentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceItem {
        private UUID id;
        private UUID tenantId;
        private String tenantName;
        private String tenantPhone;
        private String roomNumber;
        private String bedLabel;
        private String invoiceNumber;
        private String monthYear;
        private BigDecimal amount;
        private BigDecimal discountAmount;
        private LocalDate dueDate;
        private RentStatus status;
        private BigDecimal paidAmount;
        private LocalDate paidDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummary {
        private String monthYear;
        private BigDecimal totalExpected;
        private BigDecimal totalCollected;
        private BigDecimal totalPending;
        private BigDecimal totalOverdue;
        private long totalTenants;
        private long paidCount;
        private long pendingCount;
        private long overdueCount;
        private List<InvoiceItem> invoices;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateInvoicesRequest {
        @NotNull(message = "Property ID is required")
        private UUID propertyId;

        @NotNull(message = "Month Year (YYYY-MM) is required")
        private String monthYear;

        private LocalDate dueDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordOfflinePaymentRequest {
        @NotNull(message = "Invoice ID is required")
        private UUID invoiceId;

        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;

        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentReceipt {
        private UUID paymentId;
        private String paymentNumber;
        private String receiptNumber;
        private String tenantName;
        private String tenantPhone;
        private String propertyName;
        private String propertyAddress;
        private String roomNumber;
        private String bedLabel;
        private String monthYear;
        private BigDecimal amount;
        private PaymentMethod paymentMethod;
        private PaymentStatus status;
        private ZonedDateTime paidAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestMealChargeRequest {
        @NotNull(message = "Tenant ID is required")
        private UUID tenantId;

        private Integer guestCount = 1;
        private BigDecimal pricePerMeal = new BigDecimal("100.00");
        private String mealType = "DINNER";
        private String mealDate;
        private String notes;
    }
}

