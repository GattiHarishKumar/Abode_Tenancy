package com.abode.tenancy.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "property_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String category; // EXTERIOR, ROOM, BATHROOM, DINING, COMMON

    @Column(nullable = false, columnDefinition = "TEXT")
    private String photoUrl;

    private String caption;

    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
