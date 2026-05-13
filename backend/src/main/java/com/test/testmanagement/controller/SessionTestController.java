package com.test.testmanagement.controller;

import com.test.testmanagement.dto.SessionTestDTO;
import com.test.testmanagement.entity.SessionTest;
import com.test.testmanagement.service.SessionTestService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionTestController {

    private final SessionTestService sessionTestService;

    public SessionTestController(SessionTestService sessionTestService) {
        this.sessionTestService = sessionTestService;
    }

    // POST /api/sessions — Créer une session de test
    @PostMapping
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN')")
    public ResponseEntity<SessionTest> create(@Valid @RequestBody SessionTestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionTestService.create(dto));
    }

    // PUT /api/sessions/{id} — Modifier une session de test
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<SessionTest> update(@PathVariable Long id, @Valid @RequestBody SessionTestDTO dto) {
        return ResponseEntity.ok(sessionTestService.update(id, dto));
    }

    // GET /api/sessions/projet/{projetId} — Sessions d'un projet
    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<SessionTest>> findByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(sessionTestService.findByProjetId(projetId));
    }

    // GET /api/sessions/{id} — Détail d'une session
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<SessionTest> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionTestService.findById(id));
    }

    // DELETE /api/sessions/{id} — Supprimer une session
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sessionTestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
