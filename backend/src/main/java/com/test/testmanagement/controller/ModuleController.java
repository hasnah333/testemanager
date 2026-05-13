package com.test.testmanagement.controller;

import com.test.testmanagement.dto.ModuleDTO;
import com.test.testmanagement.entity.ModuleProjet;
import com.test.testmanagement.service.ModuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ModuleProjet> create(@Valid @RequestBody ModuleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.create(dto));
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<ModuleProjet>> findByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(moduleService.findByProjetId(projetId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ModuleProjet> findById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ModuleProjet> update(@PathVariable Long id, @Valid @RequestBody ModuleDTO dto) {
        return ResponseEntity.ok(moduleService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
