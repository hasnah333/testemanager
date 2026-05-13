package com.test.testmanagement.config;

import com.test.testmanagement.entity.User;
import com.test.testmanagement.enums.Role;
import com.test.testmanagement.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@test.com");
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println(">>> Utilisateur admin créé (admin/admin123)");
        } else {
            // Optionnel : réinitialiser le mot de passe de l'admin existant pour être sûr
            User admin = userRepository.findByUsername("admin").get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            System.out.println(">>> Mot de passe admin réinitialisé (admin/admin123)");
        }

        if (!userRepository.existsByUsername("testeur")) {
            User testeur = new User();
            testeur.setUsername("testeur");
            testeur.setPassword(passwordEncoder.encode("testeur123"));
            testeur.setEmail("testeur@test.com");
            testeur.setRole(Role.TESTEUR);
            testeur.setActive(true);
            userRepository.save(testeur);
            System.out.println(">>> Utilisateur testeur créé (testeur/testeur123)");
            testeur.setPassword(passwordEncoder.encode("testeur123"));
            userRepository.save(testeur);
            System.out.println(">>> Mot de passe testeur réinitialisé (testeur/testeur123)");
        }

        if (!userRepository.existsByUsername("manager")) {
            User manager = new User();
            manager.setUsername("manager");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setEmail("manager@test.com");
            manager.setRole(Role.MANAGER);
            manager.setActive(true);
            userRepository.save(manager);
            System.out.println(">>> Utilisateur manager créé (manager/manager123)");
        } else {
            User manager = userRepository.findByUsername("manager").get();
            manager.setPassword(passwordEncoder.encode("manager123"));
            userRepository.save(manager);
            System.out.println(">>> Mot de passe manager réinitialisé (manager/manager123)");
        }
    }
}
