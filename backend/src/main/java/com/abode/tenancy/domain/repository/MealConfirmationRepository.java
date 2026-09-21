package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.MealType;
import com.abode.tenancy.domain.model.MealConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MealConfirmationRepository extends JpaRepository<MealConfirmation, UUID> {
    Optional<MealConfirmation> findByTenantIdAndDateAndMealType(UUID tenantId, LocalDate date, MealType mealType);
    List<MealConfirmation> findByTenantIdAndDate(UUID tenantId, LocalDate date);
    List<MealConfirmation> findByPropertyIdAndDate(UUID propertyId, LocalDate date);
    List<MealConfirmation> findByPropertyIdAndDateAndMealType(UUID propertyId, LocalDate date, MealType mealType);
    long countByPropertyIdAndDateAndMealTypeAndIsAttending(UUID propertyId, LocalDate date, MealType mealType, Boolean isAttending);
}
