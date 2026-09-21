package com.abode.tenancy.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "meal_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    @Builder.Default
    private Boolean weekdayBreakfast = true;

    @Builder.Default
    private Boolean weekdayLunch = true;

    @Builder.Default
    private Boolean weekdayDinner = true;

    @Builder.Default
    private Boolean weekendBreakfast = true;

    @Builder.Default
    private Boolean weekendLunch = true;

    @Builder.Default
    private Boolean weekendDinner = true;
}
