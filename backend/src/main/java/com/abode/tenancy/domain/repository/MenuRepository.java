package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuRepository extends JpaRepository<Menu, UUID> {
    Optional<Menu> findByPropertyIdAndMenuDate(UUID propertyId, LocalDate menuDate);
    List<Menu> findByPropertyIdAndMenuDateBetweenOrderByMenuDateAsc(UUID propertyId, LocalDate startDate, LocalDate endDate);
}
