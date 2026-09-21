package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.BedStatus;
import com.abode.tenancy.domain.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BedRepository extends JpaRepository<Bed, UUID> {
    List<Bed> findByRoomIdOrderByBedLabelAsc(UUID roomId);
    List<Bed> findByRoomPropertyIdAndStatus(UUID propertyId, BedStatus status);
    List<Bed> findByRoomPropertyId(UUID propertyId);
    Optional<Bed> findByRoomIdAndBedLabel(UUID roomId, String bedLabel);
    long countByRoomPropertyId(UUID propertyId);
    long countByRoomPropertyIdAndStatus(UUID propertyId, BedStatus status);
}
