package com.test.testmanagement.service;

import com.test.testmanagement.dto.ModuleDTO;
import com.test.testmanagement.entity.ModuleProjet;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.ModuleProjetRepository;
import com.test.testmanagement.repository.ProjetRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

    private final ModuleProjetRepository moduleProjetRepository;
    private final ProjetRepository projetRepository;

    public ModuleService(ModuleProjetRepository moduleProjetRepository, ProjetRepository projetRepository) {
        this.moduleProjetRepository = moduleProjetRepository;
        this.projetRepository = projetRepository;
    }

    public ModuleProjet create(ModuleDTO dto) {
        Projet projet = projetRepository.findById(dto.getProjetId())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));
        ModuleProjet module = new ModuleProjet();
        module.setNom(dto.getNom());
        module.setDescription(dto.getDescription());
        module.setPriority(dto.getPriority());
        module.setProjet(projet);
        return moduleProjetRepository.save(module);
    }

    public List<ModuleProjet> findAll() {
        return moduleProjetRepository.findAll();
    }

    public List<ModuleProjet> findByProjetId(Long projetId) {
        return moduleProjetRepository.findByProjetIdOrderByNomAsc(projetId);
    }

    public ModuleProjet findById(Long id) {
        return moduleProjetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable : " + id));
    }

    public ModuleProjet update(Long id, ModuleDTO dto) {
        ModuleProjet module = findById(id);
        module.setNom(dto.getNom());
        module.setDescription(dto.getDescription());
        module.setPriority(dto.getPriority());
        return moduleProjetRepository.save(module);
    }

    public void delete(Long id) {
        moduleProjetRepository.delete(findById(id));
    }
}
