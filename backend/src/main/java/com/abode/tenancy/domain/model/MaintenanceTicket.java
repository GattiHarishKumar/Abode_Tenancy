package com.abode.tenancy.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String issue;

    @Builder.Default
    private String priority = "MEDIUM";

    @Builder.Default
    private String status = "NEW";

    @Builder.Default
    private BigDecimal estimatedCost = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal actualCost = BigDecimal.ZERO;

    private String vendorName;
    private String vendorPhone;
    private LocalDate scheduledDate;
    private ZonedDateTime resolvedAt;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}

