package com.abode.tenancy.domain.model;

import com.abode.tenancy.domain.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @Column(nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer floorNumber = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer sharingType = 2;

    @Column(nullable = false)
    private BigDecimal baseRent;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAc = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean hasBalcony = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean hasAttachedWashroom = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCleanedToday = true;

    @Column
    private ZonedDateTime lastCleanedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.AVAILABLE;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Bed> beds = new ArrayList<>();

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
