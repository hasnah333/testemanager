package com.test.testmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.test.testmanagement.enums.Role;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class MembreProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.TESTEUR;

    private LocalDate dateAssignation;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "projet_id")
    private Projet projet;

    public MembreProjet() {}

    public MembreProjet(Long id, Role role, LocalDate dateAssignation, User user, Projet projet) {
        this.id = id;
        this.role = role;
        this.dateAssignation = dateAssignation;
        this.user = user;
        this.projet = projet;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDate getDateAssignation() { return dateAssignation; }
    public void setDateAssignation(LocalDate dateAssignation) { this.dateAssignation = dateAssignation; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    @PrePersist
    public void prePersist() {
        this.dateAssignation = LocalDate.now();
    }
}
