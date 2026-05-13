package com.test.testmanagement.dto;

import com.test.testmanagement.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RegisterDTO {
    @NotBlank(message = "Le username est obligatoire")
    private String username;
    @NotBlank(message = "Le password est obligatoire")
    private String password;
    private String email;
    @NotNull(message = "Le rôle est obligatoire")
    private Role role;

    public RegisterDTO() {}

    public RegisterDTO(String username, String password, String email, Role role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
