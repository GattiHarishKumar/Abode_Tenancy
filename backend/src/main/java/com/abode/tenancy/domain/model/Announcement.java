package com.abode.tenancy.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private String targetAudience = "ALL"; // ALL, FLOOR, ROOM

    private Integer targetFloor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_room_id")
    private Room targetRoom;

    @Builder.Default
    private Boolean isPinned = false;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
