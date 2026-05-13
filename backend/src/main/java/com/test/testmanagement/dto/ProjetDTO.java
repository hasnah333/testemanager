package com.test.testmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public class ProjetDTO {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    private String description;
    private boolean archived;

    public ProjetDTO() {}

    public ProjetDTO(String nom, String description, boolean archived) {
        this.nom = nom;
        this.description = description;
        this.archived = archived;
    }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
}
