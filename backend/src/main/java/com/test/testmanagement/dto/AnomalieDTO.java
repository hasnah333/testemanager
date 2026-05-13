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
}
