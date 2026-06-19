package com.test.testmanagement.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

/**
 * Réponse renvoyée PAR le microservice FastAPI à Spring Boot.
 * {@code @JsonIgnoreProperties(ignoreUnknown = true)} : tolère d'éventuels champs en plus.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SeverityPredictionResponse {

    private String severity;            // MINEURE | MAJEURE | BLOQUANTE
    private Integer predictedClass;     // 0 | 1 | 2
    private Double confidence;          // 0..1 (heuristique)
    private Map<String, Double> scores; // score par classe
    private String modelVersion;

    public SeverityPredictionResponse() {}

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public Integer getPredictedClass() { return predictedClass; }
    public void setPredictedClass(Integer predictedClass) { this.predictedClass = predictedClass; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Map<String, Double> getScores() { return scores; }
    public void setScores(Map<String, Double> scores) { this.scores = scores; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
