package com.abode.tenancy.service;

import com.abode.tenancy.domain.model.AuditLog;
import com.abode.tenancy.domain.model.Property;
import com.abode.tenancy.domain.model.User;
import com.abode.tenancy.domain.repository.AuditLogRepository;
import com.abode.tenancy.domain.repository.PropertyRepository;
import com.abode.tenancy.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Async
    public void log(UUID propertyId, UUID userId, String action, String entityType, String entityId, String details) {
        try {
            Property property = propertyId != null ? propertyRepository.findById(propertyId).orElse(null) : null;
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

            AuditLog logEntry = AuditLog.builder()
                    .property(property)
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.error("Failed to save audit log: {}", ex.getMessage());
        }
    }
}

