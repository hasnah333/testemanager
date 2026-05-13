package com.test.testmanagement.controller;

import com.test.testmanagement.dto.ExecutionDTO;
import com.test.testmanagement.entity.Execution;
import com.test.testmanagement.service.ExecutionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/executions")
public class ExecutionController {

    private final ExecutionService executionService;

    public ExecutionController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN')")
    public ResponseEntity<Execution> lancer(@Valid @RequestBody ExecutionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(executionService.lancer(dto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN')")
    public ResponseEntity<Execution> mettreAJourStatut(@PathVariable Long id, @RequestBody ExecutionDTO dto) {
        return ResponseEntity.ok(executionService.mettreAJourStatut(id, dto));
    }

    @GetMapping("/cas/{casDeTestId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Execution>> findByCasDeTest(@PathVariable Long casDeTestId) {
        return ResponseEntity.ok(executionService.findByCasDeTestId(casDeTestId));
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Execution>> findByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(executionService.findByProjetId(projetId));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Execution>> findBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(executionService.findBySessionTestId(sessionId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Execution> findById(@PathVariable Long id) {
        return ResponseEntity.ok(executionService.findById(id));
    }

    @PostMapping("/{id}/capture")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN')")
    public ResponseEntity<Execution> joindreCapture(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(executionService.joindreCapture(id, file));
    }
}
