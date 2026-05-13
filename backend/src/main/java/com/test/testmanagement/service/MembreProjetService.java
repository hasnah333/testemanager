package com.test.testmanagement.service;

import com.test.testmanagement.entity.MembreProjet;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.exception.BadRequestException;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.MembreProjetRepository;
import com.test.testmanagement.repository.ProjetRepository;
import com.test.testmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembreProjetService {

    private final MembreProjetRepository membreProjetRepository;
    private final UserRepository userRepository;
    private final ProjetRepository projetRepository;

    public MembreProjetService(MembreProjetRepository membreProjetRepository, UserRepository userRepository, ProjetRepository projetRepository) {
        this.membreProjetRepository = membreProjetRepository;
        this.userRepository = userRepository;
        this.projetRepository = projetRepository;
    }

    public MembreProjet assigner(Long userId, Long projetId) {
        if (membreProjetRepository.existsByUserIdAndProjetId(userId, projetId)) {
            throw new BadRequestException("Cet utilisateur est déjà membre du projet");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));
        MembreProjet membreProjet = new MembreProjet();
        membreProjet.setUser(user);
        membreProjet.setProjet(projet);
        return membreProjetRepository.save(membreProjet);
    }

    public void retirer(Long userId, Long projetId) {
        if (!membreProjetRepository.existsByUserIdAndProjetId(userId, projetId)) {
            throw new ResourceNotFoundException("Membre introuvable");
        }
        membreProjetRepository.deleteByUserIdAndProjetId(userId, projetId);
    }

    public List<MembreProjet> findByProjetId(Long projetId) {
        return membreProjetRepository.findByProjetId(projetId);
    }
}
