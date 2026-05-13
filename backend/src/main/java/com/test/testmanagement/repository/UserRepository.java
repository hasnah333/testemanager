package com.test.testmanagement.repository;

import com.test.testmanagement.entity.User;
import com.test.testmanagement.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Authentification
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    // Par rôle
    List<User> findByRole(Role role);
    long countByRole(Role role);
}
