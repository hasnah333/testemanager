package com.test.testmanagement.entity;

import com.test.testmanagement.enums.ProjetStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(length = 1000)
    private String description;

    private LocalDateTime dateCreation;

    private boolean archived = false;

    @Enumerated(EnumType.STRING)
    private ProjetStatus status = ProjetStatus.EN_COURS;

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModuleProjet> modules = new ArrayList<>();

    public Projet() {}

    public Projet(Long id, String nom, String description, LocalDateTime dateCreation, List<ModuleProjet> modules) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.dateCreation = dateCreation;
        this.modules = modules;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public ProjetStatus getStatus() { return status; }
    public void setStatus(ProjetStatus status) { this.status = status; }

    public List<ModuleProjet> getModules() { return modules; }
    public void setModules(List<ModuleProjet> modules) { this.modules = modules; }

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }
}
