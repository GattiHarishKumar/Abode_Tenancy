package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.MealType;
import com.abode.tenancy.domain.model.MealPrepStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MealPrepStatusRepository extends JpaRepository<MealPrepStatus, UUID> {
    Optional<MealPrepStatus> findByPropertyIdAndDateAndMealType(UUID propertyId, LocalDate date, MealType mealType);
    List<MealPrepStatus> findByPropertyIdAndDate(UUID propertyId, LocalDate date);
}

