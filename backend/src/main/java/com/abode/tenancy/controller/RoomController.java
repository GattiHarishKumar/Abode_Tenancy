package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.domain.model.Room;
import com.abode.tenancy.dto.RoomDto;
import com.abode.tenancy.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "04. Rooms & Beds Management", description = "Visual Room Grid, Bed Allocations, and Occupancy Status")
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get all rooms for visual room map / digital register")
    public ResponseEntity<ApiResponse<List<RoomDto.Summary>>> getRoomsForProperty(@PathVariable UUID propertyId) {
        List<RoomDto.Summary> rooms = roomService.getRoomsForProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    @GetMapping("/{roomId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get detailed digital room card (tenants, rent status, open issues)")
    public ResponseEntity<ApiResponse<RoomDto.RoomDetail>> getRoomDetail(@PathVariable UUID roomId) {
        RoomDto.RoomDetail detail = roomService.getRoomDetail(roomId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PostMapping("/property/{propertyId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Add a new room with automated bed configuration")
    public ResponseEntity<ApiResponse<Room>> createRoom(@PathVariable UUID propertyId,
                                                        @Valid @RequestBody RoomDto.CreateRequest request) {
        Room room = roomService.createRoom(propertyId, request);
        return ResponseEntity.ok(ApiResponse.success("Room created successfully with " + request.getSharingType() + " beds", room));
    }

    @PutMapping("/{roomId}/cleaning-status")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF', 'SUPER_ADMIN')")
    @Operation(summary = "Toggle daily housekeeping / cleaning status of a room")
    public ResponseEntity<ApiResponse<Room>> toggleCleaningStatus(@PathVariable UUID roomId,
                                                                 @RequestParam(required = false) Boolean isCleaned) {
        Room room = roomService.toggleCleaningStatus(roomId, isCleaned);
        return ResponseEntity.ok(ApiResponse.success("Room cleaning status updated", room));
    }
}
