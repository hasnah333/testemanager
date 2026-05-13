package com.test.testmanagement.controller;

import com.test.testmanagement.dto.CasDeTestDTO;
import com.test.testmanagement.entity.CasDeTest;
import com.test.testmanagement.service.CasDeTestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cas-tests")
public class CasDeTestController {

    private final CasDeTestService casDeTestService;

    public CasDeTestController(CasDeTestService casDeTestService) {
        this.casDeTestService = casDeTestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<CasDeTest> create(@Valid @RequestBody CasDeTestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(casDeTestService.create(dto));
    }

    @GetMapping("/scenario/{scenarioId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<CasDeTest>> findByScenario(@PathVariable Long scenarioId) {
        return ResponseEntity.ok(casDeTestService.findByScenarioId(scenarioId));
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<CasDeTest>> findByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(casDeTestService.findByProjetId(projetId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<CasDeTest> findById(@PathVariable Long id) {
        return ResponseEntity.ok(casDeTestService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<CasDeTest> update(@PathVariable Long id, @Valid @RequestBody CasDeTestDTO dto) {
        return ResponseEntity.ok(casDeTestService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        casDeTestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import/{scenarioId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<CasDeTest>> importFromExcel(
            @PathVariable Long scenarioId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(casDeTestService.importFromExcel(scenarioId, file));
    }
}
