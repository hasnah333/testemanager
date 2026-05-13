package com.test.testmanagement.repository;

import com.test.testmanagement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByOrderByDateCreationDesc();
    List<Notification> findByLuFalseOrderByDateCreationDesc();
}
