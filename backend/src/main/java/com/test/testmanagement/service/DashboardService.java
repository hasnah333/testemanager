package com.test.testmanagement.service;

import com.test.testmanagement.dto.DashboardDTO;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.enums.ExecutionStatus;
import com.test.testmanagement.repository.ProjetRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final ProjetRepository projetRepository;

    public DashboardService(ProjetRepository projetRepository) {
        this.projetRepository = projetRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO getDashboard(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        return buildStats(List.of(projet));
    }

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardGlobal() {
        return buildStats(projetRepository.findAll());
    }

    private DashboardDTO buildStats(List<Projet> projets) {
        long totalModules = projets.stream().mapToLong(p -> p.getModules().size()).sum();
        long totalScenarios = projets.stream()
                .flatMap(p -> p.getModules().stream())
                .mapToLong(m -> m.getScenarios().size()).sum();
        long totalCas = projets.stream()
                .flatMap(p -> p.getModules().stream())
                .flatMap(m -> m.getScenarios().stream())
                .mapToLong(s -> s.getCasDeTests().size()).sum();
        long totalExecutions = projets.stream()
                .flatMap(p -> p.getModules().stream())
                .flatMap(m -> m.getScenarios().stream())
                .flatMap(s -> s.getCasDeTests().stream())
                .mapToLong(c -> c.getExecutions().size()).sum();
        long testsReussis = projets.stream()
                .flatMap(p -> p.getModules().stream())
                .flatMap(m -> m.getScenarios().stream())
                .flatMap(s -> s.getCasDeTests().stream())
                .flatMap(c -> c.getExecutions().stream())
                .filter(e -> e.getStatus() == ExecutionStatus.SUCCESS).count();
        long testsEchoues = projets.stream()
                .flatMap(p -> p.getModules().stream())
                .flatMap(m -> m.getScenarios().stream())
                .flatMap(s -> s.getCasDeTests().stream())
                .flatMap(c -> c.getExecutions().stream())
                .filter(e -> e.getStatus() == ExecutionStatus.FAILED).count();
        long totalAnomalies = projets.stream()
                .flatMap(p -> p.getModules().stream())
                .flatMap(m -> m.getScenarios().stream())
                .flatMap(s -> s.getCasDeTests().stream())
                .flatMap(c -> c.getExecutions().stream())
                .mapToLong(e -> e.getAnomalies().size()).sum();
        long critiques = projets.stream()
                .flatMap(p -> p.getModules().stream())
                .flatMap(m -> m.getScenarios().stream())
                .flatMap(s -> s.getCasDeTests().stream())
                .flatMap(c -> c.getExecutions().stream())
                .flatMap(e -> e.getAnomalies().stream())
                .filter(a -> a.getGravite() == com.test.testmanagement.enums.Gravite.BLOQUANTE && a.getStatut() != com.test.testmanagement.enums.StatutAnomalie.FERMEE)
                .count();
        double tauxReussite = totalExecutions == 0 ? 0 : (testsReussis * 100.0) / totalExecutions;
        return new DashboardDTO(totalModules, totalScenarios, totalCas,
                totalExecutions, testsReussis, testsEchoues, totalAnomalies, critiques, tauxReussite);
    }
}
