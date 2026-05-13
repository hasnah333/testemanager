package com.test.testmanagement.controller;

import com.test.testmanagement.entity.MembreProjet;
import com.test.testmanagement.service.MembreProjetService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membres")
public class MembreProjetController {

    private final MembreProjetService membreProjetService;

    public MembreProjetController(MembreProjetService membreProjetService) {
        this.membreProjetService = membreProjetService;
    }

    // POST /api/membres/assigner — Admin assigne un testeur
    @PostMapping("/assigner")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembreProjet> assigner(
            @RequestParam Long userId,
            @RequestParam Long projetId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(membreProjetService.assigner(userId, projetId));
    }

    // DELETE /api/membres/retirer — Admin retire un testeur
    @DeleteMapping("/retirer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> retirer(
            @RequestParam Long userId,
            @RequestParam Long projetId) {
        membreProjetService.retirer(userId, projetId);
        return ResponseEntity.noContent().build();
    }

    // GET /api/membres/projet/{projetId} — Membres d'un projet
    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<MembreProjet>> findByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(membreProjetService.findByProjetId(projetId));
    }
}
