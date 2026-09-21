package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.RentStatus;
import com.abode.tenancy.domain.model.RentInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RentInvoiceRepository extends JpaRepository<RentInvoice, UUID> {
    List<RentInvoice> findByPropertyId(UUID propertyId);
    List<RentInvoice> findByPropertyIdAndMonthYear(UUID propertyId, String monthYear);
    List<RentInvoice> findByPropertyIdAndStatus(UUID propertyId, RentStatus status);
    List<RentInvoice> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    Optional<RentInvoice> findByTenantIdAndMonthYear(UUID tenantId, String monthYear);
    Optional<RentInvoice> findByInvoiceNumber(String invoiceNumber);

    long countByPropertyIdAndStatus(UUID propertyId, RentStatus status);
    long countByPropertyIdAndMonthYearAndStatus(UUID propertyId, String monthYear, RentStatus status);

    @Query("SELECT SUM(i.amount) FROM RentInvoice i WHERE i.property.id = :propertyId AND i.monthYear = :monthYear")
    BigDecimal getTotalExpectedForMonth(@Param("propertyId") UUID propertyId, @Param("monthYear") String monthYear);

    @Query("SELECT SUM(i.paidAmount) FROM RentInvoice i WHERE i.property.id = :propertyId AND i.monthYear = :monthYear")
    BigDecimal getTotalCollectedForMonth(@Param("propertyId") UUID propertyId, @Param("monthYear") String monthYear);

    @Query("SELECT SUM(i.amount - i.paidAmount) FROM RentInvoice i WHERE i.property.id = :propertyId AND i.status = 'PENDING'")
    BigDecimal getTotalPendingRent(@Param("propertyId") UUID propertyId);

    @Query("SELECT SUM(i.amount - i.paidAmount) FROM RentInvoice i WHERE i.property.id = :propertyId AND i.status = 'OVERDUE'")
    BigDecimal getTotalOverdueRent(@Param("propertyId") UUID propertyId);
}
