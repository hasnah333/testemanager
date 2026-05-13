package com.test.testmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SessionTestDTO {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    @NotNull(message = "L'id du projet est obligatoire")
    private Long projetId;
    @NotNull(message = "L'id du testeur est obligatoire")
    private Long testeurId;
    private String statut; // Enum name
    private String commentaire;

    public SessionTestDTO() {}

    public SessionTestDTO(String nom, Long projetId, Long testeurId, String statut, String commentaire) {
        this.nom = nom;
        this.projetId = projetId;
        this.testeurId = testeurId;
        this.statut = statut;
        this.commentaire = commentaire;
    }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }

    public Long getTesteurId() { return testeurId; }
    public void setTesteurId(Long testeurId) { this.testeurId = testeurId; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
}
