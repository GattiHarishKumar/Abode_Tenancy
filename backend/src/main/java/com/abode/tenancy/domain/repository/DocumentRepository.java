package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByTenantId(UUID tenantId);
    List<Document> findByPropertyId(UUID propertyId);
}
