package com.test.testmanagement.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception métier de l'assistant IA.
 * Porte un statut HTTP et un message clair destiné à l'utilisateur final
 * (aucune stacktrace n'est exposée).
 */
public class ChatServiceException extends RuntimeException {

    private final HttpStatus status;

    public ChatServiceException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }
}
