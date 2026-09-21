package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.common.CurrentUser;
import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.domain.model.Payment;
import com.abode.tenancy.domain.repository.PaymentRepository;
import com.abode.tenancy.dto.RentDto;
import com.abode.tenancy.service.ReceiptService;
import com.abode.tenancy.service.RentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rent")
@RequiredArgsConstructor
@Tag(name = "08. Rent & Payment Management", description = "Monthly Invoicing, Offline Recording, Ledger, and Downloadable PDF Receipts")
public class RentController {

    private final RentService rentService;
    private final ReceiptService receiptService;
    private final PaymentRepository paymentRepository;

    @PostMapping("/invoices/generate")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Batch generate monthly rent invoices for active tenants")
    public ResponseEntity<ApiResponse<String>> generateInvoices(@Valid @RequestBody RentDto.GenerateInvoicesRequest request) {
        rentService.generateMonthlyInvoices(request);
        return ResponseEntity.ok(ApiResponse.success("Monthly invoices generated successfully for " + request.getMonthYear()));
    }

    @GetMapping("/dashboard/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get owner monthly rent overview and collection status")
    public ResponseEntity<ApiResponse<RentDto.DashboardSummary>> getRentDashboard(
            @PathVariable UUID propertyId,
            @RequestParam(required = false) String monthYear) {
        RentDto.DashboardSummary dashboard = rentService.getRentDashboard(propertyId, monthYear);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @PostMapping("/payments/offline")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Record offline payment (cash, UPI, bank transfer)")
    public ResponseEntity<ApiResponse<RentDto.PaymentReceipt>> recordOfflinePayment(
            @Valid @RequestBody RentDto.RecordOfflinePaymentRequest request,
            @CurrentUser UserPrincipal principal) {
        Payment payment = rentService.recordOfflinePayment(request, principal.getId());
        RentDto.PaymentReceipt receipt = rentService.getReceipt(payment.getId());
        return ResponseEntity.ok(ApiResponse.success("Payment recorded and receipt generated", receipt));
    }

    @GetMapping("/receipts/{paymentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get payment receipt data")
    public ResponseEntity<ApiResponse<RentDto.PaymentReceipt>> getReceipt(@PathVariable UUID paymentId) {
        RentDto.PaymentReceipt receipt = rentService.getReceipt(paymentId);
        return ResponseEntity.ok(ApiResponse.success(receipt));
    }

    @GetMapping("/receipts/{paymentId}/pdf")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download official PDF rent receipt (PG-<MON>-<ROOM>-<SEQ>)")
    public ResponseEntity<byte[]> downloadReceiptPdf(@PathVariable UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        byte[] pdfBytes = receiptService.generateReceiptPdf(payment);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Receipt_" + payment.getReceiptNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/guest-meals")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add guest meal charge to tenant's current monthly invoice")
    public ResponseEntity<ApiResponse<String>> addGuestMealCharge(@RequestBody RentDto.GuestMealChargeRequest request) {
        rentService.addGuestMealCharge(request);
        return ResponseEntity.ok(ApiResponse.success("Guest meal surcharge added to tenant invoice"));
    }
}
