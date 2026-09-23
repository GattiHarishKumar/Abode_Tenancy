package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.ApplicationStatus;
import com.abode.tenancy.domain.model.TenantApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TenantApplicationRepository extends JpaRepository<TenantApplication, UUID> {
    List<TenantApplication> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
    List<TenantApplication> findByPropertyIdAndStatusOrderByCreatedAtDesc(UUID propertyId, ApplicationStatus status);
    long countByPropertyIdAndStatus(UUID propertyId, ApplicationStatus status);
}

