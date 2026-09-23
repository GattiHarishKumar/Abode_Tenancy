package com.abode.tenancy.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "referrals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_tenant_id", nullable = false)
    private Tenant referrerTenant;

    @Column(nullable = false)
    private String refereeName;

    @Column(nullable = false)
    private String refereePhone;

    @Builder.Default
    private String status = "PENDING"; // PENDING, JOINED, REWARDED

    @Builder.Default
    private BigDecimal rewardDiscount = new BigDecimal("500.00");

    private LocalDate appliedDate;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}

