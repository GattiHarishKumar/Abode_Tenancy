package com.abode.tenancy.config;

import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.domain.enums.Role;
import com.abode.tenancy.domain.model.Tenant;
import com.abode.tenancy.domain.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service("securityValidationService")
@RequiredArgsConstructor
public class SecurityValidationService {

    private final TenantRepository tenantRepository;

    /**
     * Checks if the authenticated user has permission to access or modify a tenant's resource.
     * Owners, Managers, and Super Admins have full access.
     * Tenants are strictly restricted to their own tenant record.
     */
    public boolean isTenantOrAdmin(UUID tenantId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principalObj = authentication.getPrincipal();
        if (!(principalObj instanceof UserPrincipal principal)) {
            return false;
        }

        // Owners, Managers, Super Admins have broad access
        if (principal.getRole() == Role.OWNER || principal.getRole() == Role.MANAGER || principal.getRole() == Role.SUPER_ADMIN) {
            return true;
        }

        // Tenants can only access their own records
        if (principal.getRole() == Role.TENANT) {
            Optional<Tenant> tenantOpt = tenantRepository.findById(tenantId);
            if (tenantOpt.isEmpty()) {
                return false;
            }
            Tenant tenant = tenantOpt.get();
            return tenant.getUser() != null && tenant.getUser().getId().equals(principal.getId());
        }

        // Cooks have access to food operations
        return principal.getRole() == Role.COOK;
    }
}
