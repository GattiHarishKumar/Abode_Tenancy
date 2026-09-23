package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    List<InventoryItem> findByPropertyIdOrderByItemNameAsc(UUID propertyId);
}

