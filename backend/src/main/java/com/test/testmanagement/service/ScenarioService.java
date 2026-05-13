package com.test.testmanagement.service;

import com.test.testmanagement.dto.ScenarioDTO;
import com.test.testmanagement.entity.ModuleProjet;
import com.test.testmanagement.entity.Scenario;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.ModuleProjetRepository;
import com.test.testmanagement.repository.ScenarioRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScenarioService {

    private final ScenarioRepository scenarioRepository;
    private final ModuleProjetRepository moduleProjetRepository;

    public ScenarioService(ScenarioRepository scenarioRepository, ModuleProjetRepository moduleProjetRepository) {
        this.scenarioRepository = scenarioRepository;
        this.moduleProjetRepository = moduleProjetRepository;
    }

    public Scenario create(ScenarioDTO dto) {
        ModuleProjet module = moduleProjetRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable"));
        Scenario scenario = new Scenario();
        scenario.setTitre(dto.getTitre());
        scenario.setObjectif(dto.getObjectif());
        scenario.setPriority(dto.getPriority());
        scenario.setModule(module);
        return scenarioRepository.save(scenario);
    }

    public List<Scenario> findByModuleId(Long moduleId) {
        return scenarioRepository.findByModuleIdOrderByTitreAsc(moduleId);
    }

    public List<Scenario> findByProjetId(Long projetId) {
        return scenarioRepository.findByProjetId(projetId);
    }

    public Scenario findById(Long id) {
        return scenarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scénario introuvable : " + id));
    }

    public Scenario update(Long id, ScenarioDTO dto) {
        Scenario scenario = findById(id);
        scenario.setTitre(dto.getTitre());
        scenario.setObjectif(dto.getObjectif());
        scenario.setPriority(dto.getPriority());
        return scenarioRepository.save(scenario);
    }

    public void delete(Long id) {
        scenarioRepository.delete(findById(id));
    }
}
