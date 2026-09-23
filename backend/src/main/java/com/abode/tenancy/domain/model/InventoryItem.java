package com.abode.tenancy.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private String category; // GROCERY, VEGETABLE, DAIRY, CLEANING, OTHER

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private String unit = "kg";

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal lowStockThreshold = new BigDecimal("10.00");

    @UpdateTimestamp
    private ZonedDateTime lastUpdated;
}

