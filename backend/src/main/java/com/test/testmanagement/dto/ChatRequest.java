package com.test.testmanagement.dto;

import java.util.List;

public class ChatRequest {
    private String question;
    private List<ChatMessageDTO> history;
    private String context;

    // Getters and Setters
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<ChatMessageDTO> getHistory() { return history; }
    public void setHistory(List<ChatMessageDTO> history) { this.history = history; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}
