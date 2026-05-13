package com.test.testmanagement.service;

import com.test.testmanagement.dto.LoginDTO;
import com.test.testmanagement.dto.RegisterDTO;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.exception.BadRequestException;
import com.test.testmanagement.repository.UserRepository;
import com.test.testmanagement.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager AuthenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager AuthenticationManager, UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.AuthenticationManager = AuthenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public Map<String, Object> register(RegisterDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username déjà utilisé : " + dto.getUsername());
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Compte créé avec succès");
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return response;
    }

    public Map<String, Object> login(LoginDTO dto) {
        AuthenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
        
        System.out.println("DEBUG LOGIN: Utilisateur=" + user.getUsername() + ", Role en base=" + user.getRole());
        
        var userDetails = userDetailsService.loadUserByUsername(dto.getUsername());

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId());
        String token = jwtService.generateToken(extraClaims, userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("userId", user.getId());
        return response;
    }
}
