package com.test.testmanagement.entity;

import com.test.testmanagement.enums.StatutSession;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class SessionTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private LocalDateTime dateCreation;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "testeur_id")
    private User testeur;

    @Enumerated(EnumType.STRING)
    private StatutSession statut = StatutSession.OUVERTE;

    @Column(length = 2000)
    private String commentaire;

    @JsonIgnore
    @OneToMany(mappedBy = "sessionTest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Execution> executions = new ArrayList<>();

    public SessionTest() {}

    public SessionTest(Long id, String nom, LocalDateTime dateCreation, Projet projet, User testeur, List<Execution> executions) {
        this.id = id;
        this.nom = nom;
        this.dateCreation = dateCreation;
        this.projet = projet;
        this.testeur = testeur;
        this.executions = executions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public User getTesteur() { return testeur; }
    public void setTesteur(User testeur) { this.testeur = testeur; }

    public List<Execution> getExecutions() { return executions; }
    public void setExecutions(List<Execution> executions) { this.executions = executions; }

    public StatutSession getStatut() { return statut; }
    public void setStatut(StatutSession statut) { this.statut = statut; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }
}
