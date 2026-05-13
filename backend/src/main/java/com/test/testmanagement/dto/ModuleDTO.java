package com.test.testmanagement.dto;

import com.test.testmanagement.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ModuleDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String description;

    private Priority priority;

    @NotNull(message = "L'id du projet est obligatoire")
    private Long projetId;

    public ModuleDTO() {}

    public ModuleDTO(String nom, String description, Priority priority, Long projetId) {
        this.nom = nom;
        this.description = description;
        this.priority = priority;
        this.projetId = projetId;
    }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }
}
