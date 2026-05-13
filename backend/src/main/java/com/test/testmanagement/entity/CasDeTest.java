package com.test.testmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.test.testmanagement.enums.Priority;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class CasDeTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Column(length = 4000)
    private String etapes;

    @Column(length = 2000)
    private String resultatAttendu;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;

    @JsonIgnore
    @OneToMany(mappedBy = "casDeTest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Execution> executions = new ArrayList<>();

    public CasDeTest() {}

    public CasDeTest(Long id, String titre, String description, String etapes, String resultatAttendu, Scenario scenario, List<Execution> executions) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.etapes = etapes;
        this.resultatAttendu = resultatAttendu;
        this.scenario = scenario;
        this.executions = executions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getEtapes() { return etapes; }
    public void setEtapes(String etapes) { this.etapes = etapes; }

    public String getResultatAttendu() { return resultatAttendu; }
    public void setResultatAttendu(String resultatAttendu) { this.resultatAttendu = resultatAttendu; }

    public Scenario getScenario() { return scenario; }
    public void setScenario(Scenario scenario) { this.scenario = scenario; }

    public List<Execution> getExecutions() { return executions; }
    public void setExecutions(List<Execution> executions) { this.executions = executions; }
}
