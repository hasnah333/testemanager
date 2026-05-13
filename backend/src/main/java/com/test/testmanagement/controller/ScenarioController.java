package com.test.testmanagement.controller;

import com.test.testmanagement.dto.ScenarioDTO;
import com.test.testmanagement.entity.Scenario;
import com.test.testmanagement.service.ScenarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {

    private final ScenarioService scenarioService;

    public ScenarioController(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Scenario> create(@Valid @RequestBody ScenarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scenarioService.create(dto));
    }

    @GetMapping("/module/{moduleId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Scenario>> findByModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(scenarioService.findByModuleId(moduleId));
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Scenario>> findByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(scenarioService.findByProjetId(projetId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Scenario> findById(@PathVariable Long id) {
        return ResponseEntity.ok(scenarioService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Scenario> update(@PathVariable Long id, @Valid @RequestBody ScenarioDTO dto) {
        return ResponseEntity.ok(scenarioService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scenarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
