package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, UUID> {
    List<Visitor> findByPropertyIdOrderByArrivalTimeDesc(UUID propertyId);
    List<Visitor> findByPropertyIdAndArrivalTimeBetween(UUID propertyId, ZonedDateTime start, ZonedDateTime end);
    List<Visitor> findByTenantIdOrderByArrivalTimeDesc(UUID tenantId);
}

