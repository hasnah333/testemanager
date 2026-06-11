package com.test.testmanagement.dto;

/** Réponse de POST /api/chat : { "reply": "..." } */
public class ChatResponse {

    private String reply;

    public ChatResponse() {}

    public ChatResponse(String reply) { this.reply = reply; }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
}
