package com.test.testmanagement.service;

import com.test.testmanagement.dto.UserUpdateDTO;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.enums.Role;
import com.test.testmanagement.exception.BadRequestException;
import com.test.testmanagement.exception.ResourceNotFoundException;
import com.test.testmanagement.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> findTesteurs() {
        return userRepository.findByRole(Role.TESTEUR);
    }

    public List<User> findEligibleMembers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.TESTEUR || u.getRole() == Role.MANAGER)
                .toList();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + id));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + username));
    }

    /**
     * Mise à jour d'un utilisateur (username, email, mot de passe, rôle).
     * Seuls les champs renseignés (non null) sont mis à jour.
     */
    public User update(Long id, UserUpdateDTO dto) {
        User user = findById(id);

        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            if (!dto.getUsername().equals(user.getUsername())
                    && userRepository.existsByUsername(dto.getUsername())) {
                throw new BadRequestException("Ce username est déjà utilisé");
            }
            user.setUsername(dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        return userRepository.save(user);
    }

    /**
     * Supprime définitivement un utilisateur.
     */
    public void delete(Long id) {
        userRepository.delete(findById(id));
    }

    public void desactiver(Long id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    public void activer(Long id) {
        User user = findById(id);
        user.setActive(true);
        userRepository.save(user);
    }

    public void changePassword(String username, String newPassword) {
        User user = findByUsername(username);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
