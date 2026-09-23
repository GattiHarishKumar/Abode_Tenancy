package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.FoodRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface FoodRatingRepository extends JpaRepository<FoodRating, UUID> {
    List<FoodRating> findByPropertyIdAndDate(UUID propertyId, LocalDate date);
    List<FoodRating> findByTenantId(UUID tenantId);

    @Query("SELECT AVG(f.rating) FROM FoodRating f WHERE f.property.id = :propertyId")
    Double getAverageRatingForProperty(@Param("propertyId") UUID propertyId);

    @Query("SELECT AVG(f.rating) FROM FoodRating f WHERE f.property.id = :propertyId AND f.date = :date")
    Double getAverageRatingForDate(@Param("propertyId") UUID propertyId, @Param("date") LocalDate date);
}

