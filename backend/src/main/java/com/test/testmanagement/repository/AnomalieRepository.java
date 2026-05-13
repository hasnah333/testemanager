package com.test.testmanagement.repository;

import com.test.testmanagement.entity.Anomalie;
import com.test.testmanagement.enums.Gravite;
import com.test.testmanagement.enums.StatutAnomalie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnomalieRepository extends JpaRepository<Anomalie, Long> {

    List<Anomalie> findByExecutionId(Long executionId);

    List<Anomalie> findByStatut(StatutAnomalie statut);
    long countByStatut(StatutAnomalie statut);

    List<Anomalie> findByGravite(Gravite gravite);
    long countByGravite(Gravite gravite);

    List<Anomalie> findByGraviteAndStatut(Gravite gravite, StatutAnomalie statut);

    @Query("SELECT a FROM Anomalie a WHERE a.execution.casDeTest.scenario.module.projet.id = :projetId")
    List<Anomalie> findByProjetId(@Param("projetId") Long projetId);

    @Query("SELECT COUNT(a) FROM Anomalie a WHERE a.execution.casDeTest.scenario.module.projet.id = :projetId AND a.statut = :statut")
    long countByProjetIdAndStatut(@Param("projetId") Long projetId, @Param("statut") StatutAnomalie statut);

    @Query("SELECT COUNT(a) FROM Anomalie a WHERE a.execution.casDeTest.scenario.module.projet.id = :projetId")
    long countByProjetId(@Param("projetId") Long projetId);

    @Query("SELECT COUNT(a) FROM Anomalie a WHERE a.execution.casDeTest.scenario.module.projet.id = :projetId AND a.gravite = :gravite AND a.statut != 'FERMEE'")
    long countByProjetIdAndGraviteAndStatutNotFermee(@Param("projetId") Long projetId, @Param("gravite") Gravite gravite);

    List<Anomalie> findByTitreContainingIgnoreCase(String titre);

    @Query("SELECT a FROM Anomalie a JOIN a.execution.casDeTest.scenario.module.projet.membres m WHERE m.user.id = :userId AND LOWER(a.titre) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Anomalie> searchByTitreAndUserId(@Param("query") String query, @Param("userId") Long userId);
}
