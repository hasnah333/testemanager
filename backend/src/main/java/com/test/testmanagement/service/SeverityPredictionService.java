package com.test.testmanagement.service;

import com.test.testmanagement.dto.SeverityPredictionRequest;
import com.test.testmanagement.dto.SeverityPredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

/**
 * Appelle le microservice IA (FastAPI) pour prédire la sévérité d'une anomalie.
 *
 * <p>FastAPI n'est JAMAIS exposé au navigateur : seul ce service Spring l'appelle,
 * en serveur-à-serveur, avec une clé API partagée ({@code X-API-Key}).</p>
 */
@Service
public class SeverityPredictionService {

    private static final Logger log = LoggerFactory.getLogger(SeverityPredictionService.class);
    private static final String PREDICT_PATH = "/predict-severity";

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;
    private final boolean enabled;

    public SeverityPredictionService(RestTemplate severityAiRestTemplate,
                                     @Value("${severity.ai.url}") String baseUrl,
                                     @Value("${severity.ai.api-key:}") String apiKey,
                                     @Value("${severity.ai.enabled:true}") boolean enabled) {
        this.restTemplate = severityAiRestTemplate;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.enabled = enabled;
    }

    /**
     * Appel direct. Lève une exception si l'IA est indisponible.
     * Utilisé par l'endpoint d'aperçu (le front affiche alors une erreur claire).
     */
    public SeverityPredictionResponse predict(SeverityPredictionRequest req) {
        if (!enabled) {
            throw new IllegalStateException("Le service de prédiction IA est désactivé (severity.ai.enabled=false)");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set("X-API-Key", apiKey);
        }

        HttpEntity<SeverityPredictionRequest> entity = new HttpEntity<>(req, headers);
        ResponseEntity<SeverityPredictionResponse> resp =
                restTemplate.postForEntity(baseUrl + PREDICT_PATH, entity, SeverityPredictionResponse.class);

        SeverityPredictionResponse body = resp.getBody();
        if (body != null) {
            log.info("Prédiction IA : '{}' -> {} (confiance={})",
                    req.getTitre(), body.getSeverity(), body.getConfidence());
        }
        return body;
    }

    /**
     * Version tolérante : ne lève JAMAIS d'exception.
     * À utiliser lors de la sauvegarde d'une anomalie : si l'IA est en panne,
     * l'anomalie est quand même enregistrée (sans sévérité prédite).
     */
    public Optional<SeverityPredictionResponse> predictQuietly(SeverityPredictionRequest req) {
        if (!enabled) return Optional.empty();
        try {
            return Optional.ofNullable(predict(req));
        } catch (Exception ex) {
            log.warn("Prédiction IA indisponible ({}) : l'anomalie est enregistrée sans sévérité prédite.",
                    ex.getMessage());
            return Optional.empty();
        }
    }
}
