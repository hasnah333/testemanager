package com.test.testmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.test.testmanagement.exception.ChatServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Assistant IA basé sur l'API OpenRouter (compatible OpenAI), avec RAG sur données SQL.
 *
 * - Appelle POST https://openrouter.ai/api/v1/chat/completions
 * - Injecte à chaque message un contexte RAG construit en direct depuis la base MySQL
 *   (projets, cas de test, anomalies, sessions de l'utilisateur) via {@link RagContextService}.
 * - Conserve l'historique multi-tours par utilisateur (clé = username authentifié).
 * - Renvoie des messages d'erreur clairs, sans jamais exposer de stacktrace.
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    /** System prompt hybride : spécialiste des tests en priorité, mais flexible sur le reste. */
    private static final String SYSTEM_PROMPT = """
            Tu es l'assistant IA intégré à une plateforme de gestion des tests logiciels (Test Manager).
            Ta spécialité prioritaire est d'aider les équipes QA sur : les cas de test,
            les campagnes et sessions de test, les anomalies (bugs) et les rapports de test.
            Mais tu es aussi un assistant flexible et logique : tu peux répondre à d'autres
            questions utiles (développement logiciel, code, algorithmique, raisonnement,
            calculs, ou questions générales) sans refuser ni systématiquement recentrer sur les tests.
            Adapte toujours ta réponse à la question réellement posée.
            Lorsque des « DONNÉES RÉELLES DE L'APPLICATION » te sont fournies, utilise-les comme
            source de vérité pour répondre précisément aux questions sur les projets, cas de test,
            anomalies et sessions de l'utilisateur (chiffres exacts, noms, statuts).
            Si l'information demandée n'y figure pas, dis-le clairement plutôt que d'inventer.
            Réponds TOUJOURS en français, de façon concise, claire et professionnelle.
            """;

    /** Nombre maximum de tours (messages user/assistant) conservés par utilisateur. */
    private static final int MAX_HISTORY = 20;

    private final RestTemplate restTemplate;
    private final RagContextService ragContextService;
    private final String apiUrl;
    private final String apiKey;
    private final String model;
    private final String referer;
    private final String title;

    /** Historique de conversation par utilisateur (uniquement les tours user/assistant). */
    private final Map<String, List<Map<String, String>>> conversations = new ConcurrentHashMap<>();

    public ChatService(RestTemplate openRouterRestTemplate,
                       RagContextService ragContextService,
                       @Value("${openrouter.api.url}") String apiUrl,
                       @Value("${openrouter.api.key:}") String apiKey,
                       @Value("${openrouter.model}") String model,
                       @Value("${openrouter.referer:}") String referer,
                       @Value("${openrouter.title:}") String title) {
        this.restTemplate = openRouterRestTemplate;
        this.ragContextService = ragContextService;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.model = model;
        this.referer = referer;
        this.title = title;
    }

    /**
     * Envoie un message utilisateur à OpenRouter, enrichi du contexte RAG (données réelles),
     * en conservant le fil de la conversation.
     *
     * @param username    identifiant de l'utilisateur connecté (clé de session + portée des données)
     * @param userMessage message saisi par l'utilisateur
     * @return la réponse textuelle de l'assistant
     */
    public String chat(String username, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ChatServiceException(HttpStatus.SERVICE_UNAVAILABLE,
                    "L'assistant IA n'est pas configuré (clé API manquante). "
                    + "Définissez la variable d'environnement OPENROUTER_API_KEY.");
        }

        // Historique persistant = uniquement les tours user/assistant de cet utilisateur
        List<Map<String, String>> turns = conversations.computeIfAbsent(username, k -> new ArrayList<>());

        // Contexte RAG reconstruit en direct (reflète l'état actuel de la base)
        String ragContext = "";
        try {
            ragContext = ragContextService.buildContext(username);
        } catch (Exception ex) {
            log.warn("RAG : impossible de construire le contexte pour '{}'", username, ex);
        }

        // Message system = prompt + données réelles (fraîches à chaque appel)
        String systemContent = ragContext.isBlank()
                ? SYSTEM_PROMPT
                : SYSTEM_PROMPT + "\n\n" + ragContext;

        // Construit la liste de messages envoyée : system + tours précédents + nouveau message
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(message("system", systemContent));
        messages.addAll(turns);
        Map<String, String> userTurn = message("user", userMessage);
        messages.add(userTurn);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        if (referer != null && !referer.isBlank()) headers.set("HTTP-Referer", referer);
        if (title != null && !title.isBlank())     headers.set("X-Title", title);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(apiUrl, request, JsonNode.class);
            JsonNode root = response.getBody();

            if (root == null || !root.has("choices") || root.path("choices").isEmpty()) {
                throw new ChatServiceException(HttpStatus.BAD_GATEWAY,
                        "L'assistant IA n'a renvoyé aucune réponse. Réessayez.");
            }

            String reply = root.path("choices").get(0).path("message").path("content").asText("").trim();
            if (reply.isEmpty()) {
                throw new ChatServiceException(HttpStatus.BAD_GATEWAY,
                        "L'assistant IA a renvoyé une réponse vide. Réessayez.");
            }

            // Persiste le tour (user + assistant) seulement en cas de succès, puis borne l'historique
            turns.add(userTurn);
            turns.add(message("assistant", reply));
            trim(turns);
            return reply;

        } catch (HttpStatusCodeException ex) {
            int status = ex.getStatusCode().value();
            log.warn("OpenRouter a renvoyé le statut {} pour l'utilisateur '{}'", status, username);

            if (status == 429) {
                throw new ChatServiceException(HttpStatus.TOO_MANY_REQUESTS,
                        "⚠️ Le quota gratuit de l'assistant IA est atteint pour le moment. "
                        + "Merci de réessayer dans quelques minutes.");
            }
            if (status == 401 || status == 403) {
                throw new ChatServiceException(HttpStatus.SERVICE_UNAVAILABLE,
                        "L'assistant IA n'est pas configuré correctement (clé API invalide).");
            }
            throw new ChatServiceException(HttpStatus.BAD_GATEWAY,
                    "L'assistant IA est momentanément indisponible. Réessayez plus tard.");

        } catch (ChatServiceException ex) {
            throw ex;

        } catch (Exception ex) {
            log.error("Erreur inattendue lors de l'appel à OpenRouter", ex);
            throw new ChatServiceException(HttpStatus.BAD_GATEWAY,
                    "L'assistant IA est momentanément indisponible. Réessayez plus tard.");
        }
    }

    private static Map<String, String> message(String role, String content) {
        Map<String, String> m = new HashMap<>();
        m.put("role", role);
        m.put("content", content);
        return m;
    }

    /** Conserve les MAX_HISTORY derniers tours (messages user/assistant). */
    private static void trim(List<Map<String, String>> turns) {
        while (turns.size() > MAX_HISTORY) {
            turns.remove(0);
        }
    }
}
