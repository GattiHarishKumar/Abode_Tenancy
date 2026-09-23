package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.VacateStatus;
import com.abode.tenancy.domain.model.VacatingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VacatingRequestRepository extends JpaRepository<VacatingRequest, UUID> {
    List<VacatingRequest> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
    List<VacatingRequest> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    Optional<VacatingRequest> findByTenantIdAndStatus(UUID tenantId, VacateStatus status);
    long countByPropertyIdAndStatus(UUID propertyId, VacateStatus status);
}

