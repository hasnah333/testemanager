package com.test.testmanagement.service;

import com.test.testmanagement.dto.AnomalieDTO;
import com.test.testmanagement.entity.Anomalie;
import com.test.testmanagement.entity.Execution;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.enums.Gravite;
import com.test.testmanagement.enums.StatutAnomalie;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.AnomalieRepository;
import com.test.testmanagement.repository.ExecutionRepository;
import com.test.testmanagement.repository.UserRepository;
import com.test.testmanagement.repository.MembreProjetRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnomalieService {

    private final AnomalieRepository anomalieRepository;
    private final ExecutionRepository executionRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final MembreProjetRepository membreProjetRepository;

    public AnomalieService(AnomalieRepository anomalieRepository,
                           ExecutionRepository executionRepository,
                           NotificationService notificationService,
                           UserRepository userRepository,
                           MembreProjetRepository membreProjetRepository) {
        this.anomalieRepository = anomalieRepository;
        this.executionRepository = executionRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.membreProjetRepository = membreProjetRepository;
    }

    /**
     * Déclare une anomalie liée à une exécution.
     */
    public Anomalie declarer(AnomalieDTO dto, String username) {
        Execution execution = executionRepository.findById(dto.getExecutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Exécution introuvable"));

        Anomalie anomalie = new Anomalie();
        anomalie.setTitre(dto.getTitre());
        anomalie.setDescription(dto.getDescription());
        anomalie.setGravite(dto.getGravite());
        anomalie.setExecution(execution);
        anomalie.setUrlCapture(dto.getUrlCapture());

        Anomalie saved = anomalieRepository.save(anomalie);

        User actor = userRepository.findByUsername(username).orElse(null);

        // Notification pour toute anomalie, avec préfixe spécifique pour les critiques
        String prefix = saved.getGravite() == Gravite.CRITIQUE ? "⚠️ Alerte : Une anomalie CRITIQUE" : "🐞 Nouvelle anomalie (" + saved.getGravite() + ")";
        String msg = prefix + " a été déclarée sur le projet "
                     + execution.getSessionTest().getProjet().getNom() + " : " + saved.getTitre();
        notificationService.notifyProjectMembersExcept(execution.getSessionTest().getProjet(), actor, msg, saved.getGravite() == Gravite.CRITIQUE ? "CRITICAL_ANOMALY" : "NEW_ANOMALY");

        return saved;
    }

    /**
     * Change le statut d'une anomalie.
     */
    public Anomalie changerStatut(Long id, StatutAnomalie statut, String username) {
        Anomalie anomalie = findById(id);
        StatutAnomalie ancienStatut = anomalie.getStatut();
        anomalie.setStatut(statut);
        Anomalie saved = anomalieRepository.save(anomalie);

        User actor = userRepository.findByUsername(username).orElse(null);

        String msg = "🔄 L'anomalie '" + saved.getTitre() + "' a changé de statut : " 
                     + (ancienStatut != null ? ancienStatut.name() : "INCONNU") + " ➡️ " + statut.name();
        
        notificationService.notifyProjectMembersExcept(saved.getExecution().getSessionTest().getProjet(), actor, msg, "ANOMALY_STATUS_CHANGE");
        return saved;
    }

    /**
     * Ajoute un commentaire sur une anomalie.
     */
    public Anomalie commenter(Long id, String commentaire, String username) {
        Anomalie anomalie = findById(id);
        anomalie.setCommentaire(commentaire);
        Anomalie saved = anomalieRepository.save(anomalie);

        User actor = userRepository.findByUsername(username).orElse(null);

        String msg = "💬 Nouveau commentaire sur l'anomalie '" + saved.getTitre() + "' : " + commentaire;
        
        notificationService.notifyProjectMembersExcept(saved.getExecution().getSessionTest().getProjet(), actor, msg, "ANOMALY_COMMENT");
        return saved;
    }

    public List<Anomalie> findAll() {
        return anomalieRepository.findAll();
    }

    public List<Anomalie> findByProjetId(Long projetId) {
        return anomalieRepository.findByProjetId(projetId);
    }

    public List<Anomalie> findByExecutionId(Long executionId) {
        return anomalieRepository.findByExecutionId(executionId);
    }

    public Anomalie findById(Long id) {
        return anomalieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anomalie introuvable : " + id));
    }

    public Anomalie update(Long id, AnomalieDTO dto) {
        Anomalie anomalie = findById(id);
        anomalie.setTitre(dto.getTitre());
        anomalie.setDescription(dto.getDescription());
        anomalie.setGravite(dto.getGravite());
        anomalie.setUrlCapture(dto.getUrlCapture());
        return anomalieRepository.save(anomalie);
    }

    public void delete(Long id) {
        anomalieRepository.delete(findById(id));
    }
}
