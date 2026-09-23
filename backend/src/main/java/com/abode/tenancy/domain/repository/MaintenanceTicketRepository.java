package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, UUID> {
    List<MaintenanceTicket> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
    List<MaintenanceTicket> findByRoomIdOrderByCreatedAtDesc(UUID roomId);
    long countByPropertyIdAndStatusNot(UUID propertyId, String status);
}

