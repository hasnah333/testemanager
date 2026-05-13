package com.test.testmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.test.testmanagement.enums.Priority;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class ModuleProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Scenario> scenarios = new ArrayList<>();

    public ModuleProjet() {}

    public ModuleProjet(Long id, String nom, String description, Projet projet, List<Scenario> scenarios) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.projet = projet;
        this.scenarios = scenarios;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public List<Scenario> getScenarios() { return scenarios; }
    public void setScenarios(List<Scenario> scenarios) { this.scenarios = scenarios; }
}
