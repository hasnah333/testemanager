package com.test.testmanagement.service;

import com.test.testmanagement.dto.AnomalieDTO;
import com.test.testmanagement.entity.Anomalie;
import com.test.testmanagement.entity.Execution;
import com.test.testmanagement.enums.Gravite;
import com.test.testmanagement.enums.StatutAnomalie;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.AnomalieRepository;
import com.test.testmanagement.repository.ExecutionRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnomalieService {

    private final AnomalieRepository anomalieRepository;
    private final ExecutionRepository executionRepository;
    private final NotificationService notificationService;

    public AnomalieService(AnomalieRepository anomalieRepository,
                           ExecutionRepository executionRepository,
                           NotificationService notificationService) {
        this.anomalieRepository = anomalieRepository;
        this.executionRepository = executionRepository;
        this.notificationService = notificationService;
    }

    /**
     * Déclare une anomalie liée à une exécution.
     */
    public Anomalie declarer(AnomalieDTO dto) {
        Execution execution = executionRepository.findById(dto.getExecutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Exécution introuvable"));

        Anomalie anomalie = new Anomalie();
        anomalie.setTitre(dto.getTitre());
        anomalie.setDescription(dto.getDescription());
        anomalie.setGravite(dto.getGravite());
        anomalie.setExecution(execution);
        anomalie.setUrlCapture(dto.getUrlCapture());

        Anomalie saved = anomalieRepository.save(anomalie);

        // Point 3: Notification si anomalie CRITIQUE
        if (saved.getGravite() == Gravite.CRITIQUE) {
            String msg = "Alerte : Une anomalie CRITIQUE a été déclarée sur le projet "
                         + execution.getSessionTest().getProjet().getNom() + " : " + saved.getTitre();
            notificationService.createNotification(msg, "CRITICAL_ANOMALY");
        }

        return saved;
    }

    /**
     * Change le statut d'une anomalie.
     */
    public Anomalie changerStatut(Long id, StatutAnomalie statut) {
        Anomalie anomalie = findById(id);
        anomalie.setStatut(statut);
        return anomalieRepository.save(anomalie);
    }

    /**
     * Ajoute un commentaire sur une anomalie.
     */
    public Anomalie commenter(Long id, String commentaire) {
        Anomalie anomalie = findById(id);
        anomalie.setCommentaire(commentaire);
        return anomalieRepository.save(anomalie);
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
