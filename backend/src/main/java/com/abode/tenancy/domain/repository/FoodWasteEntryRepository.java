package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.FoodWasteEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface FoodWasteEntryRepository extends JpaRepository<FoodWasteEntry, UUID> {
    List<FoodWasteEntry> findByPropertyIdOrderByDateDesc(UUID propertyId);
    List<FoodWasteEntry> findByPropertyIdAndDateBetween(UUID propertyId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(w.leftoverKg) FROM FoodWasteEntry w WHERE w.property.id = :propertyId AND w.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalWasteForPeriod(@Param("propertyId") UUID propertyId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
