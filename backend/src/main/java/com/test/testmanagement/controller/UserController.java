package com.test.testmanagement.controller;

import com.test.testmanagement.dto.UserUpdateDTO;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users/me — Profil de l'utilisateur connecté
    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.findByUsername(userDetails.getUsername()));
    }

    // GET /api/users — Lister tous les utilisateurs (Admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    // GET /api/users/testeurs — Lister uniquement les testeurs
    @GetMapping("/testeurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> findTesteurs() {
        return ResponseEntity.ok(userService.findTesteurs());
    }

    @GetMapping("/eligible-members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> findEligible() {
        return ResponseEntity.ok(userService.findEligibleMembers());
    }

    // GET /api/users/{id} — Détail d'un utilisateur
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    // PUT /api/users/{id} — Modifier un utilisateur (username, email, mot de passe, rôle)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody UserUpdateDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    // DELETE /api/users/{id} — Supprimer un utilisateur
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/users/{id}/desactiver — Désactiver un compte
    @PatchMapping("/{id}/desactiver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactiver(@PathVariable Long id) {
        userService.desactiver(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/users/{id}/activer — Réactiver un compte
    @PatchMapping("/{id}/activer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activer(@PathVariable Long id) {
        userService.activer(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String newPassword) {
        userService.changePassword(userDetails.getUsername(), newPassword);
        return ResponseEntity.noContent().build();
    }
}
