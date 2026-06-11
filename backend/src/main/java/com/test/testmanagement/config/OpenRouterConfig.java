package com.test.testmanagement.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate dédié à l'appel de l'API OpenRouter.
 * Bean nommé pour éviter tout conflit avec un éventuel autre RestTemplate.
 */
@Configuration
public class OpenRouterConfig {

    @Bean
    public RestTemplate openRouterRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(60))
                .build();
    }
}
