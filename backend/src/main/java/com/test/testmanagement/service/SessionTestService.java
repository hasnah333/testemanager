package com.test.testmanagement.service;

import com.test.testmanagement.dto.SessionTestDTO;
import com.test.testmanagement.enums.StatutSession;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.entity.SessionTest;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.ProjetRepository;
import com.test.testmanagement.repository.SessionTestRepository;
import com.test.testmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionTestService {

    private final SessionTestRepository sessionTestRepository;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;

    public SessionTestService(SessionTestRepository sessionTestRepository, ProjetRepository projetRepository, UserRepository userRepository) {
        this.sessionTestRepository = sessionTestRepository;
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
    }

    /**
     * Crée une session de test pour un projet et un testeur donnés.
     */
    public SessionTest create(SessionTestDTO dto) {
        Projet projet = projetRepository.findById(dto.getProjetId())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));
        User testeur = userRepository.findById(dto.getTesteurId())
                .orElseThrow(() -> new ResourceNotFoundException("Testeur introuvable"));

        SessionTest sessionTest = new SessionTest();
        sessionTest.setNom(dto.getNom());
        sessionTest.setProjet(projet);
        sessionTest.setTesteur(testeur);
        return sessionTestRepository.save(sessionTest);
    }

    /**
     * Modifie le nom d'une session de test.
     */
    public SessionTest update(Long id, SessionTestDTO dto) {
        SessionTest session = findById(id);
        if (dto.getNom() != null) session.setNom(dto.getNom());
        if (dto.getStatut() != null) {
            session.setStatut(StatutSession.valueOf(dto.getStatut()));
        }
        if (dto.getCommentaire() != null) {
            session.setCommentaire(dto.getCommentaire());
        }
        return sessionTestRepository.save(session);
    }

    /**
     * Supprime une session de test.
     */
    public void delete(Long id) {
        sessionTestRepository.delete(findById(id));
    }

    public List<SessionTest> findByProjetId(Long projetId) {
        return sessionTestRepository.findByProjetIdOrderByDateCreationDesc(projetId);
    }

    public SessionTest findById(Long id) {
        return sessionTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable : " + id));
    }
}
