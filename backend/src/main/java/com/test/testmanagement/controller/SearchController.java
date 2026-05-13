package com.test.testmanagement.controller;

import com.test.testmanagement.entity.Anomalie;
import com.test.testmanagement.entity.CasDeTest;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.repository.AnomalieRepository;
import com.test.testmanagement.repository.CasDeTestRepository;
import com.test.testmanagement.repository.ProjetRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ProjetRepository projetRepository;
    private final CasDeTestRepository casDeTestRepository;
    private final AnomalieRepository anomalieRepository;

    public SearchController(ProjetRepository projetRepository, 
                            CasDeTestRepository casDeTestRepository, 
                            AnomalieRepository anomalieRepository) {
        this.projetRepository = projetRepository;
        this.casDeTestRepository = casDeTestRepository;
        this.anomalieRepository = anomalieRepository;
    }

    @GetMapping
    public Map<String, Object> globalSearch(
            @RequestParam String query,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {
            
        Map<String, Object> results = new HashMap<>();
        
        // Si Admin, on garde la recherche globale
        if ("ADMIN".equals(role) || userId == null) {
            results.put("projets", projetRepository.findByNomContainingIgnoreCase(query));
            results.put("tests", casDeTestRepository.findByTitreContainingIgnoreCase(query));
            results.put("anomalies", anomalieRepository.findByTitreContainingIgnoreCase(query));
        } else {
            // Sinon, on filtre par les projets où l'utilisateur est membre
            results.put("projets", projetRepository.searchByNomAndUserId(query, userId));
            results.put("tests", casDeTestRepository.searchByTitreAndUserId(query, userId));
            results.put("anomalies", anomalieRepository.searchByTitreAndUserId(query, userId));
        }
        
        return results;
    }
}
