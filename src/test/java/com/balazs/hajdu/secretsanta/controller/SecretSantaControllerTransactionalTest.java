package com.balazs.hajdu.secretsanta.controller;

import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailStatus;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.domain.response.SecretSantaResponse;
import com.balazs.hajdu.secretsanta.service.SecretSantaOrchestrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecretSantaControllerTransactionalTest {

    @Mock
    private SecretSantaOrchestrationService orchestrationService;

    private SecretSantaController controller;

    @BeforeEach
    void setUp() {
        controller = new SecretSantaController(orchestrationService);
    }

    @Test
    void shouldReturnPairsWithoutEmailWhenEmailDisabled() {
        // given
        SecretSantaRequest request = createTestRequest(false);
        SecretSantaResponse expectedResponse = SecretSantaResponse.withoutEmail(List.of(
            new Pair("alice@example.com", "bob@example.com"),
            new Pair("bob@example.com", "alice@example.com")
        ));

        when(orchestrationService.processSecretSantaRequest(request))
                .thenReturn(Mono.just(expectedResponse));

        // when & then
        StepVerifier.create(controller.generateSecretSantaPairs(request))
                .assertNext(response -> {
                    assertEquals(2, response.getPairs().size());
                    assertEquals(EmailStatus.DISABLED, response.getEmailStatus());
                    assertTrue(response.getEmailResults().isEmpty());
                    assertTrue(response.getErrors().isEmpty());
                    assertTrue(response.isSuccess());
                })
                .verifyComplete();
    }

    @Test
    void shouldReturnSuccessfulResponseWhenAllEmailsDelivered() {
        // given
        SecretSantaRequest request = createTestRequest(true);
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com"),
            new Pair("bob@example.com", "alice@example.com")
        );
        Map<String, EmailResult> emailResults = Map.of(
            "alice@example.com", EmailResult.DELIVERED,
            "bob@example.com", EmailResult.DELIVERED
        );
        SecretSantaResponse expectedResponse = SecretSantaResponse.withEmail(
            mockPairs, EmailStatus.SUCCESS, emailResults, List.of()
        );

        when(orchestrationService.processSecretSantaRequest(request))
                .thenReturn(Mono.just(expectedResponse));

        // when & then
        StepVerifier.create(controller.generateSecretSantaPairs(request))
                .assertNext(response -> {
                    assertEquals(2, response.getPairs().size());
                    assertEquals(EmailStatus.SUCCESS, response.getEmailStatus());
                    assertEquals(2, response.getEmailResults().size());
                    assertTrue(response.getErrors().isEmpty());
                    assertTrue(response.isSuccess());
                })
                .verifyComplete();
    }

    @Test
    void shouldReturnPartialResponseWhenSomeEmailsFail() {
        // given
        SecretSantaRequest request = createTestRequest(true);
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com"),
            new Pair("bob@example.com", "alice@example.com")
        );
        Map<String, EmailResult> emailResults = Map.of(
            "alice@example.com", EmailResult.DELIVERED,
            "bob@example.com", EmailResult.FAILED
        );
        List<String> errors = List.of("Failed to deliver email to: bob@example.com");
        SecretSantaResponse expectedResponse = SecretSantaResponse.withEmail(
            mockPairs, EmailStatus.PARTIAL, emailResults, errors
        );

        when(orchestrationService.processSecretSantaRequest(request))
                .thenReturn(Mono.just(expectedResponse));

        // when & then
        StepVerifier.create(controller.generateSecretSantaPairs(request))
                .assertNext(response -> {
                    assertEquals(2, response.getPairs().size());
                    assertEquals(EmailStatus.PARTIAL, response.getEmailStatus());
                    assertEquals(2, response.getEmailResults().size());
                    assertEquals(1, response.getErrors().size());
                    assertTrue(response.getErrors().get(0).contains("bob@example.com"));
                    assertFalse(response.isSuccess()); // Partial is not considered success
                })
                .verifyComplete();
    }

    @Test
    void shouldReturnFailedResponseWhenEmailServiceFails() {
        // given
        SecretSantaRequest request = createTestRequest(true);
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com")
        );
        Map<String, EmailResult> failedResults = Map.of(
            "alice@example.com", EmailResult.FAILED
        );
        List<String> errors = List.of("Email delivery failed: Email service unavailable");
        SecretSantaResponse expectedResponse = SecretSantaResponse.withEmail(
            mockPairs, EmailStatus.FAILED, failedResults, errors
        );

        when(orchestrationService.processSecretSantaRequest(request))
                .thenReturn(Mono.just(expectedResponse));

        // when & then
        StepVerifier.create(controller.generateSecretSantaPairs(request))
                .assertNext(response -> {
                    assertEquals(1, response.getPairs().size());
                    assertEquals(EmailStatus.FAILED, response.getEmailStatus());
                    assertEquals(1, response.getEmailResults().size());
                    assertEquals(EmailResult.FAILED, response.getEmailResults().get("alice@example.com"));
                    assertEquals(1, response.getErrors().size());
                    assertTrue(response.getErrors().get(0).contains("Email service unavailable"));
                })
                .verifyComplete();
    }

    @Test
    void shouldReturnAsyncPendingResponseWhenAsyncModeEnabled() {
        // given
        SecretSantaRequest request = createTestRequest(true);
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com")
        );
        Map<String, EmailResult> pendingResults = Map.of(
            "alice@example.com", EmailResult.PENDING
        );
        SecretSantaResponse expectedResponse = SecretSantaResponse.withEmail(
            mockPairs, EmailStatus.PENDING, pendingResults, List.of()
        );

        when(orchestrationService.processSecretSantaRequest(request))
                .thenReturn(Mono.just(expectedResponse));

        // when & then
        StepVerifier.create(controller.generateSecretSantaPairs(request))
                .assertNext(response -> {
                    assertEquals(1, response.getPairs().size());
                    assertEquals(EmailStatus.PENDING, response.getEmailStatus());
                    assertEquals(EmailResult.PENDING, response.getEmailResults().get("alice@example.com"));
                    assertTrue(response.getErrors().isEmpty());
                })
                .verifyComplete();
    }

    @Test
    void shouldHandleGraphGenerationError() {
        // given
        SecretSantaRequest request = createTestRequest(false);
        SecretSantaResponse failedResponse = SecretSantaResponse.failed(
            List.of("Secret Santa generation failed: Invalid request data")
        );
        
        when(orchestrationService.processSecretSantaRequest(request))
                .thenReturn(Mono.just(failedResponse));

        // when & then
        StepVerifier.create(controller.generateSecretSantaPairs(request))
                .assertNext(response -> {
                    assertTrue(response.getPairs().isEmpty());
                    assertEquals(EmailStatus.FAILED, response.getEmailStatus());
                    assertTrue(response.hasErrors());
                    assertTrue(response.getErrors().get(0).contains("Invalid request data"));
                })
                .verifyComplete();
    }

    private SecretSantaRequest createTestRequest(boolean emailEnabled) {
        SecretSantaRequest request = new SecretSantaRequest();
        request.setEmails(List.of("alice@example.com", "bob@example.com"));
        request.setEmailSendingEnabled(emailEnabled);
        request.setMappings(Map.of(
            "alice@example.com", "Alice",
            "bob@example.com", "Bob"
        ));
        request.setExclusions(Map.of());
        request.setCheats(Map.of());
        return request;
    }

}