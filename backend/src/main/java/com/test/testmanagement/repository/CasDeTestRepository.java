package com.test.testmanagement.repository;

import com.test.testmanagement.entity.CasDeTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CasDeTestRepository extends JpaRepository<CasDeTest, Long> {

    // Cas de test d'un scénario
    List<CasDeTest> findByScenarioId(Long scenarioId);
    List<CasDeTest> findByScenarioIdOrderByTitreAsc(Long scenarioId);

    // Recherche par titre
    List<CasDeTest> findByTitreContainingIgnoreCase(String titre);
    List<CasDeTest> findByScenarioIdAndTitreContainingIgnoreCase(Long scenarioId, String titre);

    // Compter
    long countByScenarioId(Long scenarioId);

    // Cas de test d'un module
    @Query("SELECT c FROM CasDeTest c WHERE c.scenario.module.id = :moduleId")
    List<CasDeTest> findByModuleId(@Param("moduleId") Long moduleId);

    // Cas de test d'un projet
    @Query("SELECT c FROM CasDeTest c WHERE c.scenario.module.projet.id = :projetId")
    List<CasDeTest> findByProjetId(@Param("projetId") Long projetId);

    @Query("SELECT c FROM CasDeTest c WHERE LOWER(c.titre) LIKE LOWER(CONCAT('%', :query, '%')) AND EXISTS (SELECT m FROM MembreProjet m WHERE m.projet = c.scenario.module.projet AND m.user.id = :userId)")
    List<CasDeTest> searchByTitreAndUserId(@Param("query") String query, @Param("userId") Long userId);

    @Query("SELECT COUNT(c) FROM CasDeTest c WHERE c.scenario.module.projet.id = :projetId")
    long countByProjetId(@Param("projetId") Long projetId);
}
