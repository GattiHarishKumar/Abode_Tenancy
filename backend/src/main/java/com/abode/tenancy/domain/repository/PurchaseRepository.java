package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {
    List<Purchase> findByPropertyIdOrderByPurchaseDateDesc(UUID propertyId);
    List<Purchase> findByPropertyIdAndPurchaseDateBetween(UUID propertyId, LocalDate start, LocalDate end);
}
