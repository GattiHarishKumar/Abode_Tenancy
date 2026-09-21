package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    List<Announcement> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);

    @Query("SELECT a FROM Announcement a WHERE a.property.id = :propertyId AND " +
           "(a.targetAudience = 'ALL' OR (a.targetAudience = 'FLOOR' AND a.targetFloor = :floorNumber) OR (a.targetAudience = 'ROOM' AND a.targetRoom.id = :roomId)) " +
           "ORDER BY a.isPinned DESC, a.createdAt DESC")
    List<Announcement> findTargetedAnnouncements(@Param("propertyId") UUID propertyId, @Param("floorNumber") Integer floorNumber, @Param("roomId") UUID roomId);
}
