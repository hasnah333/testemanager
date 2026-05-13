package com.test.testmanagement.dto;

import com.test.testmanagement.enums.ExecutionStatus;
import jakarta.validation.constraints.NotNull;

public class ExecutionDTO {

    @NotNull(message = "L'id du cas de test est obligatoire")
    private Long casDeTestId;

    @NotNull(message = "L'id de la session de test est obligatoire")
    private Long sessionTestId;

    private ExecutionStatus status;
    private String commentaire;
    private String capture;

    public ExecutionDTO() {
    }

    public ExecutionDTO(Long casDeTestId, Long sessionTestId, ExecutionStatus status, String commentaire,
            String capture) {
        this.casDeTestId = casDeTestId;
        this.sessionTestId = sessionTestId;
        this.status = status;
        this.commentaire = commentaire;
        this.capture = capture;
    }

    public Long getCasDeTestId() {
        return casDeTestId;
    }

    public void setCasDeTestId(Long casDeTestId) {
        this.casDeTestId = casDeTestId;
    }

    public Long getSessionTestId() {
        return sessionTestId;
    }

    public void setSessionTestId(Long sessionTestId) {
        this.sessionTestId = sessionTestId;
    }

    public ExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(ExecutionStatus status) {
        this.status = status;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public String getCapture() {
        return capture;
    }

    public void setCapture(String capture) {
        this.capture = capture;
    }
}
