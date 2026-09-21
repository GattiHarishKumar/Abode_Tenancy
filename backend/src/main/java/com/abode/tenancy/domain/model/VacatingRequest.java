package com.abode.tenancy.domain.model;

import com.abode.tenancy.domain.enums.VacateStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "vacating_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VacatingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    @Builder.Default
    private Integer noticeDays = 30;

    @Column(nullable = false)
    private LocalDate submitDate;

    @Column(nullable = false)
    private LocalDate expectedVacateDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VacateStatus status = VacateStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String exitNotes;

    @Builder.Default
    private Boolean roomInspected = false;

    @Builder.Default
    private Boolean keyReturned = false;

    @Builder.Default
    private Boolean pendingDuesCleared = false;

    @Builder.Default
    private Boolean depositRefunded = false;

    @Builder.Default
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
}
