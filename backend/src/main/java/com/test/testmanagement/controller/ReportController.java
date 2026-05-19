package com.test.testmanagement.controller;

import com.test.testmanagement.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTEUR')")
    public ResponseEntity<byte[]> downloadProjetReport(@PathVariable Long projetId) {
        byte[] pdf = reportService.generateProjetReport(projetId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "rapport_projet_" + projetId + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }

    @GetMapping("/projet/{projetId}/csv")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTEUR')")
    public ResponseEntity<byte[]> downloadProjetCSV(@PathVariable Long projetId) {
        byte[] csv = reportService.generateProjetCSV(projetId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("text/csv"));
        headers.setContentDispositionFormData("attachment", "rapport_projet_" + projetId + ".csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csv);
    }
}
