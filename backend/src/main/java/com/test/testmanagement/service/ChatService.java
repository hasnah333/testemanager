package com.test.testmanagement.service;

import com.test.testmanagement.dto.ChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import javax.net.ssl.SSLContext;
import java.util.*;

@Service
public class ChatService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private RestTemplate restTemplateInstance;

    private RestTemplate getRestTemplate() {
        if (restTemplateInstance != null) return restTemplateInstance;
        try {
            SSLContext sslContext = SSLContextBuilder.create()
                    .loadTrustMaterial(null, (chain, authType) -> true)
                    .build();

            var socketFactory = SSLConnectionSocketFactoryBuilder.create()
                    .setSslContext(sslContext)
                    .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                    .build();

            var connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                    .setSSLSocketFactory(socketFactory)
                    .build();

            var httpClient = HttpClients.custom()
                    .setConnectionManager(connectionManager)
                    .build();

            var factory = new HttpComponentsClientHttpRequestFactory(httpClient);
            restTemplateInstance = new RestTemplate(factory);
        } catch (Exception e) {
            restTemplateInstance = new RestTemplate();
        }
        return restTemplateInstance;
    }


    public String askGemini(ChatRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return getFallbackResponse(request.getQuestion());
        }

        RestTemplate restTemplate = getRestTemplate();
        
        Map<String, Object> body = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        // Add history if present
        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            for (var msg : request.getHistory()) {
                Map<String, Object> content = new HashMap<>();
                content.put("role", msg.getRole()); // "user" or "model"
                content.put("parts", Collections.singletonList(Collections.singletonMap("text", msg.getText())));
                contents.add(content);
            }
        }

        // Add current question with context
        StringBuilder currentPrompt = new StringBuilder();
        if (request.getContext() != null && !request.getContext().isBlank()) {
            currentPrompt.append(request.getContext()).append("\n\n");
        }
        currentPrompt.append(request.getQuestion());

        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", Collections.singletonList(Collections.singletonMap("text", currentPrompt.toString())));
        contents.add(userContent);
        
        body.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 2048);
        body.put("generationConfig", generationConfig);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(GEMINI_URL + apiKey, entity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        
                        // If it's a JSON request (generation), try to extract clean JSON
                        if (request.getContext() != null && request.getContext().contains("JSON")) {
                            return extractJson(text);
                        }
                        return text;
                    }
                }
            }
            return "⚠️ Gemini n'a retourné aucune réponse valide.";
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 429) {
                return getFallbackResponse(request.getQuestion());
            }
            return "❌ Erreur API Gemini (" + e.getStatusCode().value() + ") : " + e.getResponseBodyAsString();
        } catch (Exception e) {
            // Log the error for better debugging
            System.err.println("Gemini connection error: " + e.getMessage());
            return "❌ Erreur de connexion : " + e.getMessage();
        }
    }

    private String extractJson(String text) {
        if (text == null) return "{}";
        // Remove markdown code blocks if present
        if (text.contains("```json")) {
            text = text.substring(text.indexOf("```json") + 7);
            if (text.contains("```")) {
                text = text.substring(0, text.indexOf("```"));
            }
        } else if (text.contains("```")) {
            text = text.substring(text.indexOf("```") + 3);
            if (text.contains("```")) {
                text = text.substring(0, text.indexOf("```"));
            }
        }
        return text.trim();
    }

    public String generateTestCase(Map<String, String> data) {
        ChatRequest req = new ChatRequest();
        req.setContext("Tu es un expert en Assurance Qualité (QA). Génère un cas de test détaillé. " +
                       "RÉPONDS UNIQUEMENT AVEC UN OBJET JSON VALIDE contenant les clés : 'description', 'etapes', 'resultatAttendu'. " +
                       "Ne mets pas de texte avant ou après le JSON.");
        req.setQuestion("Titre du test : " + data.get("titre") + 
                       (data.get("scenarioTitre") != null ? "\nScénario : " + data.get("scenarioTitre") : "") +
                       (data.get("scenarioDescription") != null ? "\nContexte : " + data.get("scenarioDescription") : ""));
        return askGemini(req);
    }

    public String generateAnomalie(Map<String, String> data) {
        ChatRequest req = new ChatRequest();
        req.setContext("Tu es un testeur senior. Génère une description d'anomalie claire et professionnelle. " +
                       "RÉPONDS UNIQUEMENT AVEC LE TEXTE DE LA DESCRIPTION.");
        req.setQuestion("Anomalie détectée sur : " + data.get("titre") + 
                       (data.get("description") != null ? "\nContexte : " + data.get("description") : ""));
        return askGemini(req);
    }

    private String getFallbackResponse(String question) {
        String q = question.toLowerCase();
        if (q.contains("bonjour") || q.contains("hi") || q.contains("hello")) 
            return "Bonjour ! Je suis votre assistant QA. Malheureusement, le quota de l'IA est épuisé, je suis en mode secours.";
        if (q.contains("test")) 
            return "Un bon cas de test doit être reproductible, indépendant et avoir un résultat attendu clair. (Mode secours)";
        if (q.contains("anomalie") || q.contains("bug")) 
            return "Pour une anomalie, n'oubliez pas d'inclure les étapes de reproduction, le résultat obtenu et le résultat attendu. (Mode secours)";
        return "Désolé, le quota de l'API Gemini est atteint pour ce compte. Je ne peux répondre qu'aux questions de base sur le test logiciel pour le moment.";
    }
}

