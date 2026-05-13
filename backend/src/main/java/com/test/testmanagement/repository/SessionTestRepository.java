package com.test.testmanagement.repository;

import com.test.testmanagement.entity.SessionTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionTestRepository extends JpaRepository<SessionTest, Long> {

    List<SessionTest> findByProjetId(Long projetId);
    List<SessionTest> findByProjetIdOrderByDateCreationDesc(Long projetId);

    List<SessionTest> findByTesteurId(Long testeurId);

    long countByProjetId(Long projetId);
}
