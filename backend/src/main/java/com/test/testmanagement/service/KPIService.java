package com.test.testmanagement.service;

import com.test.testmanagement.dto.DashboardDTO;
import com.test.testmanagement.enums.ExecutionStatus;
import com.test.testmanagement.enums.Gravite;
import com.test.testmanagement.enums.StatutAnomalie;
import com.test.testmanagement.repository.AnomalieRepository;
import com.test.testmanagement.repository.ExecutionRepository;
import com.test.testmanagement.repository.CasDeTestRepository;
import com.test.testmanagement.repository.ProjetRepository;
import com.test.testmanagement.repository.ModuleProjetRepository;
import com.test.testmanagement.repository.ScenarioRepository;

import org.springframework.stereotype.Service;

@Service
public class KPIService {

    private final ProjetRepository projetRepository;
    private final ModuleProjetRepository moduleProjetRepository;
    private final ScenarioRepository scenarioRepository;
    private final CasDeTestRepository casDeTestRepository;
    private final ExecutionRepository executionRepository;
    private final AnomalieRepository anomalieRepository;

    public KPIService(ProjetRepository projetRepository,
                      ModuleProjetRepository moduleProjetRepository,
                      ScenarioRepository scenarioRepository,
                      CasDeTestRepository casDeTestRepository,
                      ExecutionRepository executionRepository,
                      AnomalieRepository anomalieRepository) {
        this.projetRepository = projetRepository;
        this.moduleProjetRepository = moduleProjetRepository;
        this.scenarioRepository = scenarioRepository;
        this.casDeTestRepository = casDeTestRepository;
        this.executionRepository = executionRepository;
        this.anomalieRepository = anomalieRepository;
    }

    /**
     * Retourne les KPIs détaillés d'un projet spécifique.
     */
    public DashboardDTO getKpisParProjet(Long projetId) {
        // Vérifie que le projet existe
        projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + projetId));

        long totalModules     = moduleProjetRepository.countByProjetId(projetId);
        long totalScenarios   = scenarioRepository.countByProjetId(projetId);
        long totalCas         = casDeTestRepository.countByProjetId(projetId);
        long totalExecutions  = executionRepository.countByProjetId(projetId);
        long testsReussis     = executionRepository.countByProjetIdAndStatus(projetId, ExecutionStatus.SUCCESS);
        long testsEchoues     = executionRepository.countByProjetIdAndStatus(projetId, ExecutionStatus.FAILED);
        long totalAnomalies   = anomalieRepository.countByProjetId(projetId);
        long critiques        = anomalieRepository.countByProjetIdAndGraviteAndStatutNotFermee(projetId, Gravite.BLOQUANTE);
        double tauxReussite   = totalExecutions == 0 ? 0 : (testsReussis * 100.0) / totalExecutions;

        return new DashboardDTO(totalModules, totalScenarios, totalCas,
                totalExecutions, testsReussis, testsEchoues, totalAnomalies, critiques, tauxReussite);
    }

    /**
     * Retourne les KPIs globaux (tous projets confondus).
     */
    public DashboardDTO getKpisGlobaux() {
        long totalModules    = moduleProjetRepository.count();
        long totalScenarios  = scenarioRepository.count();
        long totalExecutions = executionRepository.count();
        long testsReussis    = executionRepository.countByStatus(ExecutionStatus.SUCCESS);
        long testsEchoues    = executionRepository.countByStatus(ExecutionStatus.FAILED);
        long totalAnomalies  = anomalieRepository.count();
        long anomaliesOuvertes = anomalieRepository.countByStatut(StatutAnomalie.OUVERTE);
        long critiques       = anomalieRepository.countByGravite(Gravite.BLOQUANTE);
        double tauxReussite  = totalExecutions == 0 ? 0 : (testsReussis * 100.0) / totalExecutions;

        return new DashboardDTO(totalModules, totalScenarios, casDeTestRepository.count(),
                totalExecutions, testsReussis, testsEchoues, totalAnomalies, critiques, tauxReussite);
    }
}
