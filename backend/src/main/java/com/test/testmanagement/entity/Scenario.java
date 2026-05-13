package com.test.testmanagement.entity;

import com.test.testmanagement.enums.Priority;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Scenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 1000)
    private String objectif;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "module_id")
    private ModuleProjet module;

    @OneToMany(mappedBy = "scenario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CasDeTest> casDeTests = new ArrayList<>();

    public Scenario() {}

    public Scenario(Long id, String titre, String objectif, ModuleProjet module, List<CasDeTest> casDeTests) {
        this.id = id;
        this.titre = titre;
        this.objectif = objectif;
        this.module = module;
        this.casDeTests = casDeTests;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getObjectif() { return objectif; }
    public void setObjectif(String objectif) { this.objectif = objectif; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public ModuleProjet getModule() { return module; }
    public void setModule(ModuleProjet module) { this.module = module; }

    public List<CasDeTest> getCasDeTests() { return casDeTests; }
    public void setCasDeTests(List<CasDeTest> casDeTests) { this.casDeTests = casDeTests; }
}
