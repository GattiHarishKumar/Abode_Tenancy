package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByPropertyIdOrderByPaidAtDesc(UUID propertyId);
    List<Payment> findByTenantIdOrderByPaidAtDesc(UUID tenantId);
    List<Payment> findByInvoiceId(UUID invoiceId);
    Optional<Payment> findByReceiptNumber(String receiptNumber);
    Optional<Payment> findByPaymentNumber(String paymentNumber);
    Optional<Payment> findByGatewayPaymentId(String gatewayPaymentId);
}
