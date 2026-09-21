package com.abode.tenancy.service;

import com.abode.tenancy.domain.model.Notification;
import com.abode.tenancy.domain.model.Property;
import com.abode.tenancy.domain.model.User;
import com.abode.tenancy.domain.repository.NotificationRepository;
import com.abode.tenancy.domain.repository.PropertyRepository;
import com.abode.tenancy.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @Async
    public void sendNotification(UUID userId, UUID propertyId, String category, String title, String message, String linkUrl) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            Property property = propertyRepository.findById(propertyId).orElse(null);

            if (user != null && property != null) {
                Notification notification = Notification.builder()
                        .user(user)
                        .property(property)
                        .category(category)
                        .title(title)
                        .message(message)
                        .linkUrl(linkUrl)
                        .isRead(false)
                        .build();

                notificationRepository.save(notification);
                log.info("Notification sent to user {}: [{}] {}", user.getPhone(), category, title);
            }
        } catch (Exception ex) {
            log.error("Failed to send notification: {}", ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}

