package com.test.testmanagement.repository;

import com.test.testmanagement.entity.ModuleProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleProjetRepository extends JpaRepository<ModuleProjet, Long> {

    // Modules d'un projet
    List<ModuleProjet> findByProjetId(Long projetId);
    List<ModuleProjet> findByProjetIdOrderByNomAsc(Long projetId);

    // Recherche par nom dans un projet
    List<ModuleProjet> findByProjetIdAndNomContainingIgnoreCase(Long projetId, String nom);

    // Compter
    long countByProjetId(Long projetId);

    // Supprimer tous les modules d'un projet
    void deleteByProjetId(Long projetId);

    // Vérifier existence
    boolean existsByNomAndProjetId(String nom, Long projetId);

    // Scénarios d'un module
    @Query("SELECT COUNT(s) FROM Scenario s WHERE s.module.id = :moduleId")
    long countScenariosByModuleId(@Param("moduleId") Long moduleId);
}
