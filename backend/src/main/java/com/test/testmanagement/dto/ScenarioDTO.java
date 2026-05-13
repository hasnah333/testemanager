package com.test.testmanagement.dto;

import com.test.testmanagement.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ScenarioDTO {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String objectif;

    private Priority priority;

    @NotNull(message = "L'id du module est obligatoire")
    private Long moduleId;

    public ScenarioDTO() {}

    public ScenarioDTO(String titre, String objectif, Priority priority, Long moduleId) {
        this.titre = titre;
        this.objectif = objectif;
        this.priority = priority;
        this.moduleId = moduleId;
    }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getObjectif() { return objectif; }
    public void setObjectif(String objectif) { this.objectif = objectif; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
}
