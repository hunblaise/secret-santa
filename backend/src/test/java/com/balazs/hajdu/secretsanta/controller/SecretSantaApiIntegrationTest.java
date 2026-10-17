package com.balazs.hajdu.secretsanta.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecretSantaApiIntegrationTest {
    @Value("${local.server.port}")
    int port;
    WebTestClient client;

    @BeforeEach
    void setUp() {
        client = WebTestClient.bindToServer().baseUrl("http://localhost:" + port).build();
    }

    @Test
    void generatesCompleteConstrainedDrawOverHttp() {
        post("""
                {"emails":["a","b","c"],"cheats":{"a":"b","b":"c","c":"a"},
                 "emailSendingEnabled":false}
                """)
                .jsonPath("$.pairs.length()").isEqualTo(3)
                .jsonPath("$.emailStatus").isEqualTo("DISABLED")
                .jsonPath("$.errors").isEmpty()
                .jsonPath("$.timestamp").exists();
    }

    @Test
    void impossibleDrawFailsBeforeAnyEmailDelivery() {
        post("""
                {"emails":["a@example.com","b@example.com"],
                 "exclusions":{"a@example.com":["b@example.com"]},"emailSendingEnabled":true}
                """)
                .jsonPath("$.pairs").isEmpty()
                .jsonPath("$.emailResults").isEmpty()
                .jsonPath("$.emailStatus").isEqualTo("FAILED")
                .jsonPath("$.errors[0]").exists();
    }

    @Test
    void invalidRequestReturnsStructuredFailure() {
        post("{}").jsonPath("$.pairs").isEmpty()
                .jsonPath("$.emailStatus").isEqualTo("FAILED")
                .jsonPath("$.errors[0]").exists();
    }

    private WebTestClient.BodyContentSpec post(String json) {
        return client.post().uri("/generatePairs")
                .header("Content-Type", "application/json").bodyValue(json)
                .exchange().expectStatus().isOk().expectBody();
    }
}
