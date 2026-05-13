package com.test.testmanagement.repository;

import com.test.testmanagement.entity.MembreProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembreProjetRepository extends JpaRepository<MembreProjet, Long> {

    List<MembreProjet> findByProjetId(Long projetId);
    List<MembreProjet> findByUserId(Long userId);
    boolean existsByUserIdAndProjetId(Long userId, Long projetId);
    Optional<MembreProjet> findByUserIdAndProjetId(Long userId, Long projetId);

    @Transactional
    void deleteByUserIdAndProjetId(Long userId, Long projetId);

    long countByProjetId(Long projetId);
}
