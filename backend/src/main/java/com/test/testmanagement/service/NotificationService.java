package com.test.testmanagement.service;

import com.test.testmanagement.entity.Notification;
import com.test.testmanagement.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(String message, String type) {
        Notification notification = new Notification(message, type);
        notificationRepository.save(notification);
    }

    public List<Notification> getAll() {
        return notificationRepository.findByOrderByDateCreationDesc();
    }

    public List<Notification> getUnread() {
        return notificationRepository.findByLuFalseOrderByDateCreationDesc();
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByLuFalseOrderByDateCreationDesc();
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
    }
}
