package com.test.testmanagement.repository;

import com.test.testmanagement.entity.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {

    List<Projet> findByNomContainingIgnoreCase(String nom);
    boolean existsByNom(String nom);

    @Query("SELECT mp.projet FROM MembreProjet mp WHERE mp.user.id = :userId")
    List<Projet> findProjetsByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Projet p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :query, '%')) AND EXISTS (SELECT m FROM MembreProjet m WHERE m.projet = p AND m.user.id = :userId)")
    List<Projet> searchByNomAndUserId(@Param("query") String query, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM ModuleProjet m WHERE m.projet.id = :projetId")
    long countModulesByProjetId(@Param("projetId") Long projetId);
}
