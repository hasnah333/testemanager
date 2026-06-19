package com.test.testmanagement.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate dédié à l'appel du microservice IA (FastAPI) de prédiction de sévérité.
 * Bean nommé pour éviter tout conflit avec les autres RestTemplate (ex: OpenRouter).
 * Timeouts courts : une prédiction doit répondre en quelques dizaines de ms.
 */
@Configuration
public class SeverityAiConfig {

    @Bean
    public RestTemplate severityAiRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(2))
                .setReadTimeout(Duration.ofSeconds(8))
                .build();
    }
}
