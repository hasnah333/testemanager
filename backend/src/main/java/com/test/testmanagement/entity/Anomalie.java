package com.test.testmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.test.testmanagement.enums.Gravite;
import com.test.testmanagement.enums.StatutAnomalie;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Anomalie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    // Sévérité FINALE (celle qui fait foi : choisie/validée par l'utilisateur).
    // C'est ce champ qui joue le rôle de "finalSeverity".
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gravite gravite;

    // Sévérité PRÉDITE par l'IA (informative ; peut différer de la sévérité finale).
    @Enumerated(EnumType.STRING)
    private Gravite predictedSeverity;

    // Confiance de la prédiction IA (0..1), null si l'IA n'a pas été appelée.
    private Double predictionConfidence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAnomalie statut = StatutAnomalie.OUVERTE;

    @Column(length = 2000)
    private String commentaire;

    private String urlCapture;

    private LocalDateTime dateCreation;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "execution_id")
    private Execution execution;

    public Anomalie() {}

    public Anomalie(Long id, String titre, String description, Gravite gravite, StatutAnomalie statut, String commentaire, LocalDateTime dateCreation, Execution execution) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.gravite = gravite;
        this.statut = statut;
        this.commentaire = commentaire;
        this.dateCreation = dateCreation;
        this.execution = execution;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Gravite getGravite() { return gravite; }
    public void setGravite(Gravite gravite) { this.gravite = gravite; }

    public Gravite getPredictedSeverity() { return predictedSeverity; }
    public void setPredictedSeverity(Gravite predictedSeverity) { this.predictedSeverity = predictedSeverity; }

    public Double getPredictionConfidence() { return predictionConfidence; }
    public void setPredictionConfidence(Double predictionConfidence) { this.predictionConfidence = predictionConfidence; }

    public StatutAnomalie getStatut() { return statut; }
    public void setStatut(StatutAnomalie statut) { this.statut = statut; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public String getUrlCapture() { return urlCapture; }
    public void setUrlCapture(String urlCapture) { this.urlCapture = urlCapture; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public Execution getExecution() { return execution; }
    public void setExecution(Execution execution) { this.execution = execution; }

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) this.statut = StatutAnomalie.OUVERTE;
    }
}
