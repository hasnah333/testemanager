package com.test.testmanagement.controller;

import com.test.testmanagement.dto.AnomalieDTO;
import com.test.testmanagement.entity.Anomalie;
import com.test.testmanagement.enums.StatutAnomalie;
import com.test.testmanagement.service.AnomalieService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anomalies")
public class AnomalieController {

    private final AnomalieService anomalieService;

    public AnomalieController(AnomalieService anomalieService) {
        this.anomalieService = anomalieService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN')")
    public ResponseEntity<Anomalie> declarer(@Valid @RequestBody AnomalieDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(anomalieService.declarer(dto, userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Anomalie>> findAll() {
        return ResponseEntity.ok(anomalieService.findAll());
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Anomalie>> findByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(anomalieService.findByProjetId(projetId));
    }

    @GetMapping("/execution/{executionId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Anomalie>> findByExecution(@PathVariable Long executionId) {
        return ResponseEntity.ok(anomalieService.findByExecutionId(executionId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Anomalie> findById(@PathVariable Long id) {
        return ResponseEntity.ok(anomalieService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Anomalie> update(@PathVariable Long id, @Valid @RequestBody AnomalieDTO dto) {
        return ResponseEntity.ok(anomalieService.update(id, dto));
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Anomalie> changerStatut(@PathVariable Long id, @RequestParam StatutAnomalie statut, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(anomalieService.changerStatut(id, statut, userDetails.getUsername()));
    }

    @PostMapping("/{id}/commentaire")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Anomalie> commenter(@PathVariable Long id, @RequestBody String commentaire, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(anomalieService.commenter(id, commentaire, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        anomalieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
