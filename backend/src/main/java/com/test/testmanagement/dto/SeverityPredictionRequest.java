package com.test.testmanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Données envoyées par Spring Boot AU microservice FastAPI pour demander une prédiction.
 * Les noms JSON correspondent EXACTEMENT au schéma Pydantic côté Python (snake_case
 * pour {@code type_anomalie} et {@code etapes_reproduction}).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SeverityPredictionRequest {

    private String titre;
    private String description;
    private String priorite;
    private String module;

    @JsonProperty("type_anomalie")
    private String typeAnomalie;

    private String impact;
    private String environnement;

    @JsonProperty("etapes_reproduction")
    private String etapesReproduction;

    private String statut;

    public SeverityPredictionRequest() {}

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}
