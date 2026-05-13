package com.test.testmanagement.controller;

import com.test.testmanagement.dto.DashboardDTO;
import com.test.testmanagement.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{projetId}")
    @PreAuthorize("hasRole('TESTEUR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Long projetId) {
        return ResponseEntity.ok(dashboardService.getDashboard(projetId));
    }

    @GetMapping("/global")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<DashboardDTO> getDashboardGlobal() {
        return ResponseEntity.ok(dashboardService.getDashboardGlobal());
    }
}
