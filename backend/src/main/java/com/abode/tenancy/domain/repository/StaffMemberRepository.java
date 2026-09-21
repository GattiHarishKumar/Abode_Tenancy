package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, UUID> {
    List<StaffMember> findByPropertyId(UUID propertyId);
    Optional<StaffMember> findByPropertyIdAndUserId(UUID propertyId, UUID userId);
    List<StaffMember> findByUserId(UUID userId);
}
