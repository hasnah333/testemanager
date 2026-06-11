package com.test.testmanagement.controller;

import com.test.testmanagement.dto.ChatRequest;
import com.test.testmanagement.dto.ChatResponse;
import com.test.testmanagement.exception.ChatServiceException;
import com.test.testmanagement.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Assistant IA — POST /api/chat
 * Reçoit { "message": "..." } et renvoie { "reply": "..." }.
 * L'historique de conversation est conservé par utilisateur authentifié.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatRequest request) {
        try {
            String reply = chatService.chat(userDetails.getUsername(), request.getMessage());
            return ResponseEntity.ok(new ChatResponse(reply));
        } catch (ChatServiceException ex) {
            // Message clair pour l'utilisateur, statut HTTP adapté, sans stacktrace
            return ResponseEntity.status(ex.getStatus()).body(new ChatResponse(ex.getMessage()));
        }
    }
}
