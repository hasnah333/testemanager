package com.test.testmanagement.dto;

import com.test.testmanagement.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CasDeTestDTO {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String description;
    private Priority priority;
    private String etapes;
    private String resultatAttendu;

    @NotNull(message = "L'id du scénario est obligatoire")
    private Long scenarioId;

    public CasDeTestDTO() {}

    public CasDeTestDTO(String titre, String description, Priority priority, String etapes, String resultatAttendu, Long scenarioId) {
        this.titre = titre;
        this.description = description;
        this.priority = priority;
        this.etapes = etapes;
        this.resultatAttendu = resultatAttendu;
        this.scenarioId = scenarioId;
    }

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

    public Long getScenarioId() { return scenarioId; }
    public void setScenarioId(Long scenarioId) { this.scenarioId = scenarioId; }
}
