package com.test.testmanagement.repository;

import com.test.testmanagement.entity.Execution;
import com.test.testmanagement.enums.ExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExecutionRepository extends JpaRepository<Execution, Long> {

    List<Execution> findByCasDeTestId(Long casDeTestId);
    List<Execution> findByCasDeTestIdOrderByDateExecutionDesc(Long casDeTestId);

    List<Execution> findByStatus(ExecutionStatus status);
    long countByStatus(ExecutionStatus status);

    List<Execution> findByCasDeTestIdAndStatus(Long casDeTestId, ExecutionStatus status);

    List<Execution> findBySessionTestId(Long sessionTestId);

    @Query("SELECT e FROM Execution e WHERE e.casDeTest.scenario.module.projet.id = :projetId")
    List<Execution> findByProjetId(@Param("projetId") Long projetId);

    @Query("SELECT COUNT(e) FROM Execution e WHERE e.casDeTest.scenario.module.projet.id = :projetId AND e.status = :status")
    long countByProjetIdAndStatus(@Param("projetId") Long projetId, @Param("status") ExecutionStatus status);

    @Query("SELECT COUNT(e) FROM Execution e WHERE e.casDeTest.scenario.module.projet.id = :projetId")
    long countByProjetId(@Param("projetId") Long projetId);

    List<Execution> findByDateExecutionBetween(LocalDateTime debut, LocalDateTime fin);
}
