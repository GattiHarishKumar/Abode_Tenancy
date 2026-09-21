package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.RoomStatus;
import com.abode.tenancy.domain.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findByPropertyIdOrderByRoomNumberAsc(UUID propertyId);
    List<Room> findByPropertyIdAndStatus(UUID propertyId, RoomStatus status);
    Optional<Room> findByPropertyIdAndRoomNumber(UUID propertyId, String roomNumber);
    long countByPropertyId(UUID propertyId);
}
