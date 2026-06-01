package com.test.testmanagement.service;

import com.test.testmanagement.config.OllamaProperties;
import com.test.testmanagement.exception.OllamaServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.SocketTimeoutException;
import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaChatbotService implements ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(OllamaChatbotService.class);

    private final RestTemplate restTemplate;
    private final OllamaProperties ollamaProperties;

    public OllamaChatbotService(RestTemplate restTemplate, OllamaProperties ollamaProperties) {
        this.restTemplate = restTemplate;
        this.ollamaProperties = ollamaProperties;
    }

    @Override
    public String ask(String question) {
        String url = ollamaProperties.getBaseUrl() + "/api/generate";

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", ollamaProperties.getModel());
        payload.put("prompt", buildPrompt(question));
        payload.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            log.info("Sending request to Ollama model={} url={}", ollamaProperties.getModel(), url);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            if (response == null) {
                throw new OllamaServiceException("Aucune réponse reçue depuis Ollama.");
            }

            Object answer = response.get("response");
            if (answer == null || answer.toString().trim().isEmpty()) {
                throw new OllamaServiceException("Réponse vide du modèle IA.");
            }

            return answer.toString().trim();

        } catch (ResourceAccessException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof SocketTimeoutException) {
                throw new OllamaServiceException("Timeout de communication avec Ollama.", ex);
            }
            throw new OllamaServiceException("Service Ollama indisponible. Assurez-vous qu'Ollama est démarré.", ex);
        } catch (OllamaServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected Ollama integration error", ex);
            throw new OllamaServiceException("Erreur inattendue lors de l'appel à Ollama.", ex);
        }
    }

    private String buildPrompt(String userQuestion) {
        return """
                Tu es un assistant IA expert en gestion des tests logiciels (QA), intégré à une plateforme de test management.
                Règles absolues :
                - Réponds TOUJOURS en français
                - Sois concis et précis (3-5 phrases maximum sauf si plus de détail est demandé)
                - Tes réponses portent sur les tests logiciels : cas de test, scénarios, anomalies, sessions, modules, rapports
                - Si la question est hors sujet, réponds brièvement et recentre sur le domaine QA
                - Ne commence pas ta réponse par "Je suis un assistant IA" ou des introductions inutiles

                Question :
                """ + userQuestion;
    }
}
