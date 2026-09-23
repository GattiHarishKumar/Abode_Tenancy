package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {
    List<Referral> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
    List<Referral> findByReferrerTenantIdOrderByCreatedAtDesc(UUID tenantId);
}

