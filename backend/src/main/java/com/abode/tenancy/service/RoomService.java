package com.abode.tenancy.service;

import com.abode.tenancy.domain.enums.BedStatus;
import com.abode.tenancy.domain.enums.ComplaintStatus;
import com.abode.tenancy.domain.enums.RentStatus;
import com.abode.tenancy.domain.enums.RoomStatus;
import com.abode.tenancy.domain.model.*;
import com.abode.tenancy.domain.repository.*;
import com.abode.tenancy.dto.RoomDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;
    private final ComplaintRepository complaintRepository;
    private final RentInvoiceRepository rentInvoiceRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<RoomDto.Summary> getRoomsForProperty(UUID propertyId) {
        List<Room> rooms = roomRepository.findByPropertyIdOrderByRoomNumberAsc(propertyId);
        List<Tenant> tenants = tenantRepository.findByPropertyId(propertyId);
        Map<UUID, Tenant> bedToTenantMap = tenants.stream()
                .filter(t -> t.getBed() != null)
                .collect(Collectors.toMap(t -> t.getBed().getId(), t -> t, (existing, replace) -> existing));

        return rooms.stream().map(room -> {
            List<RoomDto.BedItem> bedItems = room.getBeds().stream().map(bed -> {
                Tenant tenant = bedToTenantMap.get(bed.getId());
                boolean onNotice = tenant != null && (tenant.getStatus() != null && tenant.getStatus().name().equals("ON_NOTICE") || tenant.getVacatingDate() != null);
                return RoomDto.BedItem.builder()
                        .id(bed.getId())
                        .bedLabel(bed.getBedLabel())
                        .status(bed.getStatus())
                        .currentTenantId(tenant != null ? tenant.getId() : null)
                        .currentTenantName(tenant != null ? tenant.getUser().getFullName() : null)
                        .currentTenantPhone(tenant != null ? tenant.getUser().getPhone() : null)
                        .isOnNotice(onNotice)
                        .vacatingDate(tenant != null && tenant.getVacatingDate() != null ? tenant.getVacatingDate().toString() : null)
                        .build();
            }).collect(Collectors.toList());

            int totalBeds = room.getBeds().size();
            int occupiedBeds = (int) room.getBeds().stream().filter(b -> b.getStatus() == BedStatus.OCCUPIED).count();
            int availableBeds = totalBeds - occupiedBeds;

            return RoomDto.Summary.builder()
                    .id(room.getId())
                    .roomNumber(room.getRoomNumber())
                    .floorNumber(room.getFloorNumber())
                    .sharingType(room.getSharingType())
                    .baseRent(room.getBaseRent())
                    .isAc(room.getIsAc() != null ? room.getIsAc() : false)
                    .hasBalcony(room.getHasBalcony() != null ? room.getHasBalcony() : false)
                    .hasAttachedWashroom(room.getHasAttachedWashroom() != null ? room.getHasAttachedWashroom() : true)
                    .isCleanedToday(room.getIsCleanedToday() != null ? room.getIsCleanedToday() : true)
                    .lastCleanedAt(room.getLastCleanedAt() != null ? room.getLastCleanedAt().toString() : null)
                    .status(room.getStatus())
                    .totalBeds(totalBeds)
                    .occupiedBeds(occupiedBeds)
                    .availableBeds(availableBeds)
                    .beds(bedItems)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomDto.RoomDetail getRoomDetail(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        List<Tenant> tenants = tenantRepository.findByPropertyId(room.getProperty().getId());
        Map<UUID, Tenant> bedToTenantMap = tenants.stream()
                .filter(t -> t.getBed() != null && t.getRoom() != null && t.getRoom().getId().equals(roomId))
                .collect(Collectors.toMap(t -> t.getBed().getId(), t -> t, (e, r) -> e));

        String currentMonth = String.format("%d-%02d", java.time.LocalDate.now().getYear(), java.time.LocalDate.now().getMonthValue());

        List<RoomDto.BedDetail> bedDetails = room.getBeds().stream().map(bed -> {
            Tenant t = bedToTenantMap.get(bed.getId());
            String rentStatus = "N/A";
            if (t != null) {
                Optional<RentInvoice> inv = rentInvoiceRepository.findByTenantIdAndMonthYear(t.getId(), currentMonth);
                rentStatus = inv.map(i -> i.getStatus().name()).orElse("PENDING");
            }
            return RoomDto.BedDetail.builder()
                    .bedId(bed.getId())
                    .bedLabel(bed.getBedLabel())
                    .status(bed.getStatus())
                    .tenantId(t != null ? t.getId() : null)
                    .tenantName(t != null ? t.getUser().getFullName() : null)
                    .tenantPhone(t != null ? t.getUser().getPhone() : null)
                    .joiningDate(t != null ? t.getJoiningDate().toString() : null)
                    .rentStatus(rentStatus)
                    .build();
        }).collect(Collectors.toList());

        List<Complaint> complaints = complaintRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        List<RoomDto.RoomComplaint> openComplaints = complaints.stream()
                .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED)
                .map(c -> RoomDto.RoomComplaint.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .category(c.getCategory().name())
                        .status(c.getStatus().name())
                        .createdAt(c.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        return RoomDto.RoomDetail.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floorNumber(room.getFloorNumber())
                .sharingType(room.getSharingType())
                .baseRent(room.getBaseRent())
                .isAc(room.getIsAc() != null ? room.getIsAc() : false)
                .hasBalcony(room.getHasBalcony() != null ? room.getHasBalcony() : false)
                .hasAttachedWashroom(room.getHasAttachedWashroom() != null ? room.getHasAttachedWashroom() : true)
                .isCleanedToday(room.getIsCleanedToday() != null ? room.getIsCleanedToday() : true)
                .lastCleanedAt(room.getLastCleanedAt() != null ? room.getLastCleanedAt().toString() : null)
                .status(room.getStatus())
                .beds(bedDetails)
                .openComplaints(openComplaints)
                .build();
    }

    @Transactional
    public Room createRoom(UUID propertyId, RoomDto.CreateRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        if (roomRepository.findByPropertyIdAndRoomNumber(propertyId, request.getRoomNumber()).isPresent()) {
            throw new IllegalArgumentException("Room " + request.getRoomNumber() + " already exists in this property");
        }

        Room room = Room.builder()
                .property(property)
                .roomNumber(request.getRoomNumber())
                .floorNumber(request.getFloorNumber())
                .sharingType(request.getSharingType())
                .baseRent(request.getBaseRent())
                .isAc(request.getIsAc() != null ? request.getIsAc() : false)
                .hasBalcony(request.getHasBalcony() != null ? request.getHasBalcony() : false)
                .hasAttachedWashroom(request.getHasAttachedWashroom() != null ? request.getHasAttachedWashroom() : true)
                .isCleanedToday(true)
                .lastCleanedAt(java.time.ZonedDateTime.now())
                .status(RoomStatus.AVAILABLE)
                .build();

        room = roomRepository.save(room);

        // Automatically create beds for the sharing type
        char label = 'A';
        for (int i = 0; i < request.getSharingType(); i++) {
            Bed bed = Bed.builder()
                    .room(room)
                    .bedLabel("Bed " + (char)(label + i))
                    .status(BedStatus.AVAILABLE)
                    .build();
            bedRepository.save(bed);
        }

        auditService.log(propertyId, null, "CREATE", "Room", room.getId().toString(), "Created room " + room.getRoomNumber());
        return room;
    }

    @Transactional
    public Room toggleCleaningStatus(UUID roomId, Boolean isCleaned) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        room.setIsCleanedToday(isCleaned != null ? isCleaned : !Boolean.TRUE.equals(room.getIsCleanedToday()));
        if (Boolean.TRUE.equals(room.getIsCleanedToday())) {
            room.setLastCleanedAt(java.time.ZonedDateTime.now());
        }
        return roomRepository.save(room);
    }

    @Transactional
    public void updateRoomStatus(UUID roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return;

        List<Bed> beds = bedRepository.findByRoomIdOrderByBedLabelAsc(roomId);
        long occupied = beds.stream().filter(b -> b.getStatus() == BedStatus.OCCUPIED).count();

        if (occupied == 0) {
            room.setStatus(RoomStatus.AVAILABLE);
        } else if (occupied == beds.size()) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(RoomStatus.PARTIALLY_OCCUPIED);
        }
        roomRepository.save(room);
    }
}

