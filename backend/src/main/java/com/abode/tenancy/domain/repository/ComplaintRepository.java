package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.ComplaintStatus;
import com.abode.tenancy.domain.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
    List<Complaint> findByPropertyIdAndStatusNot(UUID propertyId, ComplaintStatus status);
    List<Complaint> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<Complaint> findByRoomIdOrderByCreatedAtDesc(UUID roomId);
    long countByPropertyIdAndStatus(UUID propertyId, ComplaintStatus status);
    long countByPropertyIdAndStatusNot(UUID propertyId, ComplaintStatus status);
}

