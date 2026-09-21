package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.MealPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MealPreferenceRepository extends JpaRepository<MealPreference, UUID> {
    Optional<MealPreference> findByTenantId(UUID tenantId);
}
