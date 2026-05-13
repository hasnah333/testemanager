package com.test.testmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.test.testmanagement.enums.ExecutionStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Execution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status = ExecutionStatus.PENDING;

    @Column(length = 2000)
    private String commentaire;

    @Column(length = 500)
    private String capture;

    private LocalDateTime dateExecution;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cas_de_test_id")
    private CasDeTest casDeTest;

    @ManyToOne(optional = false)
    @JoinColumn(name = "session_test_id")
    private SessionTest sessionTest;

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anomalie> anomalies = new ArrayList<>();

    public Execution() {}

    public Execution(Long id, ExecutionStatus status, String commentaire, String capture, LocalDateTime dateExecution, CasDeTest casDeTest, SessionTest sessionTest, List<Anomalie> anomalies) {
        this.id = id;
        this.status = status;
        this.commentaire = commentaire;
        this.capture = capture;
        this.dateExecution = dateExecution;
        this.casDeTest = casDeTest;
        this.sessionTest = sessionTest;
        this.anomalies = anomalies;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getDateExecution() {
        return dateExecution;
    }

    public void setDateExecution(LocalDateTime dateExecution) {
        this.dateExecution = dateExecution;
    }

    public CasDeTest getCasDeTest() {
        return casDeTest;
    }

    public void setCasDeTest(CasDeTest casDeTest) {
        this.casDeTest = casDeTest;
    }

    public SessionTest getSessionTest() {
        return sessionTest;
    }

    public void setSessionTest(SessionTest sessionTest) {
        this.sessionTest = sessionTest;
    }

    public List<Anomalie> getAnomalies() {
        return anomalies;
    }

    public void setAnomalies(List<Anomalie> anomalies) {
        this.anomalies = anomalies;
    }

    @PrePersist
    public void prePersist() {
        this.dateExecution = LocalDateTime.now();
        if (this.status == null) this.status = ExecutionStatus.PENDING;
    }
}
