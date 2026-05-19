package com.test.testmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    private LocalDateTime dateCreation;

    private boolean lu = false;

    private String type; // e.g., "CRITICAL_ANOMALY"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Notification() {}

    public Notification(User user, String message, String type) {
        this.user = user;
        this.message = message;
        this.type = type;
        this.dateCreation = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }
}
