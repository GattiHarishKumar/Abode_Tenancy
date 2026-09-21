package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
