package com.test.testmanagement.controller;

import com.test.testmanagement.dto.ChatRequest;
import com.test.testmanagement.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/ask")
    public Map<String, String> ask(@RequestBody ChatRequest request) {
        String reply = chatService.askGemini(request);
        Map<String, String> response = new HashMap<>();
        response.put("reply", reply);
        return response;
    }

    @PostMapping("/generate-test-case")
    public Map<String, String> generateTestCase(@RequestBody Map<String, String> data) {
        String raw = chatService.generateTestCase(data);
        Map<String, String> response = new HashMap<>();
        response.put("raw", raw);
        return response;
    }

    @PostMapping("/generate-anomalie")
    public Map<String, String> generateAnomalie(@RequestBody Map<String, String> data) {
        String description = chatService.generateAnomalie(data);
        Map<String, String> response = new HashMap<>();
        response.put("description", description);
        return response;
    }
}
