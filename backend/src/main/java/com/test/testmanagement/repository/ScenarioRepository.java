package com.test.testmanagement.repository;

import com.test.testmanagement.entity.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, Long> {

    // Scénarios d'un module
    List<Scenario> findByModuleId(Long moduleId);
    List<Scenario> findByModuleIdOrderByTitreAsc(Long moduleId);

    // Recherche
    List<Scenario> findByTitreContainingIgnoreCase(String titre);
    List<Scenario> findByModuleIdAndTitreContainingIgnoreCase(Long moduleId, String titre);

    // Compter
    long countByModuleId(Long moduleId);

    // Tous les scénarios d'un projet (via module)
    @Query("SELECT s FROM Scenario s WHERE s.module.projet.id = :projetId")
    List<Scenario> findByProjetId(@Param("projetId") Long projetId);

    @Query("SELECT COUNT(s) FROM Scenario s WHERE s.module.projet.id = :projetId")
    long countByProjetId(@Param("projetId") Long projetId);
}
