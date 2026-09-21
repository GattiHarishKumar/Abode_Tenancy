package com.abode.tenancy.domain.model;

import com.abode.tenancy.domain.enums.MealPrepState;
import com.abode.tenancy.domain.enums.MealType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "meal_prep_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPrepStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType mealType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MealPrepState status = MealPrepState.NOT_STARTED;

    @Builder.Default
    private Integer preparedCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
}
