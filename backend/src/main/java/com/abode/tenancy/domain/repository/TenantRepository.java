package com.abode.tenancy.domain.repository;

import com.abode.tenancy.domain.enums.TenantStatus;
import com.abode.tenancy.domain.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    List<Tenant> findByPropertyId(UUID propertyId);
    List<Tenant> findByPropertyIdAndStatus(UUID propertyId, TenantStatus status);
    Optional<Tenant> findByUserId(UUID userId);
    Optional<Tenant> findByUserIdAndStatus(UUID userId, TenantStatus status);
    long countByPropertyIdAndStatus(UUID propertyId, TenantStatus status);

    @Query("SELECT t FROM Tenant t WHERE t.property.id = :propertyId AND " +
           "(LOWER(t.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.user.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.room.roomNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Tenant> searchTenants(@Param("propertyId") UUID propertyId, @Param("query") String query);
}
