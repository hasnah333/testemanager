package com.test.testmanagement.service;

import com.test.testmanagement.entity.Notification;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.entity.MembreProjet;
import com.test.testmanagement.enums.Role;
import com.test.testmanagement.repository.NotificationRepository;
import com.test.testmanagement.repository.UserRepository;
import com.test.testmanagement.repository.MembreProjetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MembreProjetRepository membreProjetRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               MembreProjetRepository membreProjetRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.membreProjetRepository = membreProjetRepository;
    }

    public void createNotification(User user, String message, String type) {
        Notification notification = new Notification(user, message, type);
        notificationRepository.save(notification);
    }

    public void notifyProjectMembersExcept(Projet projet, User actor, String message, String type) {
        // Find all project members
        List<MembreProjet> members = membreProjetRepository.findByProjetId(projet.getId());
        for (MembreProjet member : members) {
            User user = member.getUser();
            if (user != null && (actor == null || !user.getId().equals(actor.getId()))) {
                createNotification(user, message, type);
            }
        }
        // Also notify all admins who are not the actor
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            if (actor == null || !admin.getId().equals(actor.getId())) {
                boolean isAlreadyNotified = members.stream()
                        .anyMatch(m -> m.getUser() != null && m.getUser().getId().equals(admin.getId()));
                if (!isAlreadyNotified) {
                    createNotification(admin, message, type);
                }
            }
        }
    }

    public List<Notification> getAllByUser(User user) {
        return notificationRepository.findByUserIdOrderByDateCreationDesc(user.getId());
    }

    public List<Notification> getUnreadByUser(User user) {
        return notificationRepository.findByUserIdAndLuFalseOrderByDateCreationDesc(user.getId());
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsReadByUser(User user) {
        List<Notification> unread = notificationRepository.findByUserIdAndLuFalseOrderByDateCreationDesc(user.getId());
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
    }
}
