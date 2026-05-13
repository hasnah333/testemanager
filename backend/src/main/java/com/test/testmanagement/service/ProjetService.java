package com.test.testmanagement.service;

import com.test.testmanagement.dto.ProjetDTO;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.exception.BadRequestException;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.ProjetRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjetService {

    private final ProjetRepository projetRepository;

    public ProjetService(ProjetRepository projetRepository) {
        this.projetRepository = projetRepository;
    }

    public Projet create(ProjetDTO dto) {
        if (projetRepository.existsByNom(dto.getNom()))
            throw new BadRequestException("Un projet avec ce nom existe déjà");
        Projet projet = new Projet();
        projet.setNom(dto.getNom());
        projet.setDescription(dto.getDescription());
        return projetRepository.save(projet);
    }

    public List<Projet> findAll() {
        return projetRepository.findAll();
    }

    public Projet findById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + id));
    }

    public Projet update(Long id, ProjetDTO dto) {
        Projet projet = findById(id);
        // Vérifier le doublon uniquement si le nom change
        if (!projet.getNom().equals(dto.getNom()) && projetRepository.existsByNom(dto.getNom())) {
            throw new BadRequestException("Un projet avec ce nom existe déjà");
        }
        System.out.println("Updating project " + id + ": nom=" + dto.getNom() + ", archived=" + dto.isArchived());
        projet.setNom(dto.getNom());
        projet.setDescription(dto.getDescription());
        projet.setArchived(dto.isArchived());
        return projetRepository.save(projet);
    }

    public void delete(Long id) {
        projetRepository.delete(findById(id));
    }

    public Projet validate(Long id) {
        Projet projet = findById(id);
        projet.setStatus(com.test.testmanagement.enums.ProjetStatus.VALIDE);
        return projetRepository.save(projet);
    }

    public List<Projet> findByTesteur(Long userId) {
        return projetRepository.findProjetsByUserId(userId);
    }
}
