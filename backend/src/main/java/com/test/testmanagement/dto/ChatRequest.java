package com.test.testmanagement.dto;

import jakarta.validation.constraints.NotBlank;

/** Corps de la requête POST /api/chat : { "message": "..." } */
public class ChatRequest {

    @NotBlank(message = "Le message ne doit pas être vide")
    private String message;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
