package com.test.testmanagement.service;

import com.test.testmanagement.dto.ExecutionDTO;
import com.test.testmanagement.entity.CasDeTest;
import com.test.testmanagement.entity.Execution;
import com.test.testmanagement.entity.SessionTest;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.CasDeTestRepository;
import com.test.testmanagement.repository.ExecutionRepository;
import com.test.testmanagement.repository.SessionTestRepository;
import com.test.testmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ExecutionService {

    private final ExecutionRepository executionRepository;
    private final CasDeTestRepository casDeTestRepository;
    private final SessionTestRepository sessionTestRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public ExecutionService(ExecutionRepository executionRepository, 
                            CasDeTestRepository casDeTestRepository, 
                            SessionTestRepository sessionTestRepository, 
                            CloudinaryService cloudinaryService,
                            NotificationService notificationService,
                            UserRepository userRepository) {
        this.executionRepository = executionRepository;
        this.casDeTestRepository = casDeTestRepository;
        this.sessionTestRepository = sessionTestRepository;
        this.cloudinaryService = cloudinaryService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /**
     * Lance une nouvelle exécution d'un cas de test dans une session.
     */
    public Execution lancer(ExecutionDTO dto, String username) {
        CasDeTest cas = casDeTestRepository.findById(dto.getCasDeTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Cas de test introuvable"));
        SessionTest session = sessionTestRepository.findById(dto.getSessionTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Session de test introuvable"));

        Execution execution = new Execution();
        execution.setCasDeTest(cas);
        execution.setSessionTest(session);
        execution.setStatus(dto.getStatus());
        execution.setCommentaire(dto.getCommentaire());
        execution.setCapture(dto.getCapture());
        Execution saved = executionRepository.save(execution);

        User actor = userRepository.findByUsername(username).orElse(null);

        if (saved.getStatus() == com.test.testmanagement.enums.ExecutionStatus.FAILED) {
            String msg = "❌ L'exécution du cas de test '" + cas.getTitre() + "' a échoué (FAILED) dans la session '" + session.getNom() + "'";
            notificationService.notifyProjectMembersExcept(session.getProjet(), actor, msg, "EXECUTION_FAILED");
        } else if (saved.getStatus() == com.test.testmanagement.enums.ExecutionStatus.SUCCESS) {
            String msg = "✅ L'exécution du cas de test '" + cas.getTitre() + "' a réussi (SUCCESS) dans la session '" + session.getNom() + "'";
            notificationService.notifyProjectMembersExcept(session.getProjet(), actor, msg, "EXECUTION_SUCCESS");
        }

        return saved;
    }

    /**
     * Met à jour le statut et/ou le commentaire d'une exécution.
     */
    public Execution mettreAJourStatut(Long id, ExecutionDTO dto, String username) {
        Execution execution = findById(id);
        com.test.testmanagement.enums.ExecutionStatus oldStatus = execution.getStatus();
        if (dto.getStatus() != null)      execution.setStatus(dto.getStatus());
        if (dto.getCommentaire() != null) execution.setCommentaire(dto.getCommentaire());
        Execution saved = executionRepository.save(execution);

        User actor = userRepository.findByUsername(username).orElse(null);

        if (oldStatus != saved.getStatus()) {
            if (saved.getStatus() == com.test.testmanagement.enums.ExecutionStatus.FAILED) {
                String msg = "❌ L'exécution du cas de test '" + saved.getCasDeTest().getTitre() + "' a échoué (FAILED) dans la session '" + saved.getSessionTest().getNom() + "'";
                notificationService.notifyProjectMembersExcept(saved.getSessionTest().getProjet(), actor, msg, "EXECUTION_FAILED");
            } else if (saved.getStatus() == com.test.testmanagement.enums.ExecutionStatus.SUCCESS) {
                String msg = "✅ L'exécution du cas de test '" + saved.getCasDeTest().getTitre() + "' a réussi (SUCCESS) dans la session '" + saved.getSessionTest().getNom() + "'";
                notificationService.notifyProjectMembersExcept(saved.getSessionTest().getProjet(), actor, msg, "EXECUTION_SUCCESS");
            }
        }

        return saved;
    }

    /**
     * Upload une capture d'écran vers Cloudinary et l'associe à l'exécution.
     */
    public Execution joindreCapture(Long id, MultipartFile file) {
        Execution execution = findById(id);
        String imageUrl = cloudinaryService.uploadImage(file);
        execution.setCapture(imageUrl);
        return executionRepository.save(execution);
    }

    public List<Execution> findByCasDeTestId(Long casDeTestId) {
        return executionRepository.findByCasDeTestIdOrderByDateExecutionDesc(casDeTestId);
    }

    public List<Execution> findByProjetId(Long projetId) {
        return executionRepository.findByProjetId(projetId);
    }

    public List<Execution> findBySessionTestId(Long sessionTestId) {
        return executionRepository.findBySessionTestId(sessionTestId);
    }

    public Execution findById(Long id) {
        return executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exécution introuvable : " + id));
    }
}
