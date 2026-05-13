package com.test.testmanagement.controller;

import com.test.testmanagement.dto.DashboardDTO;
import com.test.testmanagement.service.KPIService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kpis")
public class KPIController {

    private final KPIService kpiService;

    public KPIController(KPIService kpiService) {
        this.kpiService = kpiService;
    }

    // GET /api/kpis/projet/{projetId} — KPIs d'un projet spécifique
    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<DashboardDTO> getKpisParProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(kpiService.getKpisParProjet(projetId));
    }

    // GET /api/kpis/global — KPIs globaux (Admin seulement)
    @GetMapping("/global")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<DashboardDTO> getKpisGlobaux() {
        return ResponseEntity.ok(kpiService.getKpisGlobaux());
    }
}
