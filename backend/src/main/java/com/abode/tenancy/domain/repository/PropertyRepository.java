package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findByOwnerId(UUID ownerId);
    Optional<Property> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
