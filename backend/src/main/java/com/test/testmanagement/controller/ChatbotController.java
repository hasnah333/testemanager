package com.test.testmanagement.controller;

import com.test.testmanagement.dto.ChatRequest;
import com.test.testmanagement.dto.ChatResponse;
import com.test.testmanagement.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(java.util.Map.of("status", "UP", "service", "chatbot"));
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> ask(@Valid @RequestBody ChatRequest request) {
        String answer = chatbotService.ask(request.getQuestion());
        return ResponseEntity.ok(new ChatResponse(answer));
    }
}
