package com.abode.tenancy.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "menus")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private LocalDate menuDate;

    @Column(columnDefinition = "TEXT")
    private String breakfastItems;

    @Builder.Default
    private String breakfastStart = "08:00";

    @Builder.Default
    private String breakfastEnd = "10:00";

    @Column(columnDefinition = "TEXT")
    private String lunchItems;

    @Builder.Default
    private String lunchStart = "12:30";

    @Builder.Default
    private String lunchEnd = "14:30";

    @Column(columnDefinition = "TEXT")
    private String dinnerItems;

    @Builder.Default
    private String dinnerStart = "19:30";

    @Builder.Default
    private String dinnerEnd = "21:30";

    @Builder.Default
    private Boolean isPublished = false;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
}

