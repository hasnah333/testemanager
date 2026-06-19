package com.test.testmanagement.dto;

import com.test.testmanagement.enums.Gravite;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AnomalieDTO {
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;
    private String description;
    @NotNull(message = "La gravité est obligatoire")
    private Gravite gravite;
    @NotNull(message = "L'id de l'exécution est obligatoire")
    private Long executionId;
    private String urlCapture;

    // ── Champs OPTIONNELS utilisés uniquement pour la prédiction IA de sévérité ──
    // (non persistés en base ; ils enrichissent le texte envoyé au modèle)
    private String priorite;            // Blocker / Major / Minor ...
    private String module;              // module ou projet concerné
    private String typeAnomalie;        // Bug / Improvement / Task ...
    private String impact;              // impact métier
    private String environnement;       // prod / recette / dev ...
    private String etapesReproduction;  // étapes de reproduction

    public AnomalieDTO() {}

    public AnomalieDTO(String titre, String description, Gravite gravite, Long executionId) {
        this.titre = titre;
        this.description = description;
        this.gravite = gravite;
        this.executionId = executionId;
    }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Gravite getGravite() { return gravite; }
    public void setGravite(Gravite gravite) { this.gravite = gravite; }

    public Long getExecutionId() { return executionId; }
    public void setExecutionId(Long executionId) { this.executionId = executionId; }

    public String getUrlCapture() { return urlCapture; }
    public void setUrlCapture(String urlCapture) { this.urlCapture = urlCapture; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }

    public String getTypeAnomalie() { return typeAnomalie; }
    public void setTypeAnomalie(String typeAnomalie) { this.typeAnomalie = typeAnomalie; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public String getEnvironnement() { return environnement; }
    public void setEnvironnement(String environnement) { this.environnement = environnement; }

    public String getEtapesReproduction() { return etapesReproduction; }
    public void setEtapesReproduction(String etapesReproduction) { this.etapesReproduction = etapesReproduction; }
}
