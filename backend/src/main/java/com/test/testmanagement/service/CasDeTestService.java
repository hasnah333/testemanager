package com.test.testmanagement.service;

import com.test.testmanagement.dto.CasDeTestDTO;
import com.test.testmanagement.entity.CasDeTest;
import com.test.testmanagement.entity.Scenario;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.CasDeTestRepository;
import com.test.testmanagement.repository.ScenarioRepository;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class CasDeTestService {

    private final CasDeTestRepository casDeTestRepository;
    private final ScenarioRepository scenarioRepository;

    public CasDeTestService(CasDeTestRepository casDeTestRepository, ScenarioRepository scenarioRepository) {
        this.casDeTestRepository = casDeTestRepository;
        this.scenarioRepository = scenarioRepository;
    }

    public CasDeTest create(CasDeTestDTO dto) {
        Scenario scenario = scenarioRepository.findById(dto.getScenarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Scénario introuvable"));
        CasDeTest cas = new CasDeTest();
        cas.setTitre(dto.getTitre());
        cas.setDescription(dto.getDescription());
        cas.setPriority(dto.getPriority());
        cas.setEtapes(dto.getEtapes());
        cas.setResultatAttendu(dto.getResultatAttendu());
        cas.setScenario(scenario);
        return casDeTestRepository.save(cas);
    }

    public List<CasDeTest> findByScenarioId(Long scenarioId) {
        return casDeTestRepository.findByScenarioIdOrderByTitreAsc(scenarioId);
    }

    public List<CasDeTest> findByProjetId(Long projetId) {
        return casDeTestRepository.findByProjetId(projetId);
    }

    public CasDeTest findById(Long id) {
        return casDeTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cas de test introuvable : " + id));
    }

    public CasDeTest update(Long id, CasDeTestDTO dto) {
        CasDeTest cas = findById(id);
        cas.setTitre(dto.getTitre());
        cas.setDescription(dto.getDescription());
        cas.setPriority(dto.getPriority());
        cas.setEtapes(dto.getEtapes());
        cas.setResultatAttendu(dto.getResultatAttendu());
        return casDeTestRepository.save(cas);
    }

    public void delete(Long id) {
        casDeTestRepository.delete(findById(id));
    }

    /**
     * Importe des cas de test depuis un fichier Excel (.xlsx).
     * Colonnes attendues : Titre | Description | Étapes | Résultat Attendu
     */
    public List<CasDeTest> importFromExcel(Long scenarioId, MultipartFile file) {
        Scenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Scénario introuvable"));

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<CasDeTest> imported = new ArrayList<>();

            // La ligne 0 est l'en-tête, on démarre à 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String titre = getCellValue(row, 0);
                if (titre == null || titre.isBlank()) continue; // ignore lignes vides

                CasDeTest casBuilder = new CasDeTest();
                casBuilder.setTitre(titre);
                casBuilder.setDescription(getCellValue(row, 1));
                casBuilder.setEtapes(getCellValue(row, 2));
                casBuilder.setResultatAttendu(getCellValue(row, 3));
                casBuilder.setScenario(scenario);
                CasDeTest cas = casDeTestRepository.save(casBuilder);
                imported.add(cas);
            }
            return imported;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier Excel", e);
        }
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private String getCellValue(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> null;
        };
    }
}
