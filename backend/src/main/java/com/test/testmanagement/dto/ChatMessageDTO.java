package com.test.testmanagement.dto;

public class ChatMessageDTO {
    private String role; // "user" or "model"
    private String text;

    public ChatMessageDTO() {}
    public ChatMessageDTO(String role, String text) {
        this.role = role;
        this.text = text;
    }

    // Getters and Setters
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
