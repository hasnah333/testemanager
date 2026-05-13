package com.test.testmanagement.controller;

import com.test.testmanagement.dto.ProjetDTO;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.service.ProjetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    private final ProjetService projetService;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
    }

    // POST /api/projets — Créer un projet (Admin seulement)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Projet> create(@Valid @RequestBody ProjetDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projetService.create(dto));
    }

    // GET /api/projets — Lister tous les projets
    @GetMapping
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Projet>> findAll() {
        return ResponseEntity.ok(projetService.findAll());
    }

    // GET /api/projets/{id} — Détail d'un projet
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Projet> findById(@PathVariable Long id) {
        return ResponseEntity.ok(projetService.findById(id));
    }

    // PUT /api/projets/{id} — Modifier un projet (Admin seulement)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Projet> update(@PathVariable Long id, @Valid @RequestBody ProjetDTO dto) {
        return ResponseEntity.ok(projetService.update(id, dto));
    }

    // DELETE /api/projets/{id} — Supprimer un projet (Admin seulement)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/projets/testeur/{userId} — Projets d'un testeur
    @GetMapping("/testeur/{userId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Projet>> findByTesteur(@PathVariable Long userId) {
        return ResponseEntity.ok(projetService.findByTesteur(userId));
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Projet> validate(@PathVariable Long id) {
        return ResponseEntity.ok(projetService.validate(id));
    }
}
