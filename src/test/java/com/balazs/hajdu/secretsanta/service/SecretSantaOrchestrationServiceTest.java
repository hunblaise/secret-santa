package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.EmailDeliveryResult;
import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailStatus;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.domain.response.SecretSantaResponse;
import com.balazs.hajdu.secretsanta.service.strategy.EmailDeliveryStrategy;
import com.balazs.hajdu.secretsanta.service.strategy.EmailDeliveryStrategyFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecretSantaOrchestrationServiceTest {

    @Mock
    private GraphMappingService graphMappingService;
    
    @Mock
    private HamiltonianTourService tourService;
    
    @Mock
    private EmailDeliveryStrategyFactory emailDeliveryStrategyFactory;
    
    @Mock
    private SecretSantaResponseBuilder responseBuilder;
    
    @Mock
    private EmailDeliveryStrategy emailDeliveryStrategy;
    
    private SecretSantaOrchestrationService orchestrationService;
    
    @BeforeEach
    void setUp() {
        orchestrationService = new SecretSantaOrchestrationService(
            graphMappingService,
            tourService,
            emailDeliveryStrategyFactory,
            responseBuilder
        );
    }
    
    @Test
    void shouldProcessRequestWithoutEmailSuccessfully() {
        // given
        SecretSantaRequest request = createTestRequest(false);
        Graph mockGraph = createMockGraph();
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com"),
            new Pair("bob@example.com", "alice@example.com")
        );
        SecretSantaResponse expectedResponse = SecretSantaResponse.withoutEmail(mockPairs);
        
        when(graphMappingService.generateGraph(request)).thenReturn(Mono.just(mockGraph));
        when(tourService.generateSecretSantaPairs(mockGraph)).thenReturn(Flux.fromIterable(mockPairs));
        when(responseBuilder.buildResponseWithoutEmail(mockPairs)).thenReturn(expectedResponse);
        
        // when & then
        StepVerifier.create(orchestrationService.processSecretSantaRequest(request))
                .assertNext(response -> {
                    assertEquals(2, response.getPairs().size());
                    assertEquals(EmailStatus.DISABLED, response.getEmailStatus());
                    assertTrue(response.isSuccess());
                })
                .verifyComplete();
    }
    
    @Test
    void shouldProcessRequestWithEmailSuccessfully() {
        // given
        SecretSantaRequest request = createTestRequest(true);
        Graph mockGraph = createMockGraph();
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com")
        );
        EmailDeliveryResult deliveryResult = EmailDeliveryResult.success(
            Map.of("alice@example.com", EmailResult.DELIVERED)
        );
        SecretSantaResponse expectedResponse = SecretSantaResponse.withEmail(
            mockPairs, EmailStatus.SUCCESS, Map.of("alice@example.com", EmailResult.DELIVERED), List.of()
        );
        
        when(graphMappingService.generateGraph(request)).thenReturn(Mono.just(mockGraph));
        when(tourService.generateSecretSantaPairs(mockGraph)).thenReturn(Flux.fromIterable(mockPairs));
        when(emailDeliveryStrategyFactory.getStrategy()).thenReturn(emailDeliveryStrategy);
        when(emailDeliveryStrategy.getStrategyName()).thenReturn("test-strategy");
        when(emailDeliveryStrategy.deliverEmails(mockPairs, request.getMappings()))
                .thenReturn(Mono.just(deliveryResult));
        when(responseBuilder.buildResponseWithEmail(mockPairs, deliveryResult)).thenReturn(expectedResponse);
        
        // when & then
        StepVerifier.create(orchestrationService.processSecretSantaRequest(request))
                .assertNext(response -> {
                    assertEquals(1, response.getPairs().size());
                    assertEquals(EmailStatus.SUCCESS, response.getEmailStatus());
                    assertTrue(response.isSuccess());
                })
                .verifyComplete();
    }
    
    @Test
    void shouldHandleEmailDeliveryFailure() {
        // given
        SecretSantaRequest request = createTestRequest(true);
        Graph mockGraph = createMockGraph();
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com")
        );
        EmailDeliveryResult failedResult = EmailDeliveryResult.failed(
            Map.of("alice@example.com", EmailResult.FAILED),
            List.of("Email delivery failed: Service unavailable")
        );
        SecretSantaResponse expectedResponse = SecretSantaResponse.withEmail(
            mockPairs, EmailStatus.FAILED, Map.of("alice@example.com", EmailResult.FAILED), 
            List.of("Email delivery failed: Service unavailable")
        );
        
        when(graphMappingService.generateGraph(request)).thenReturn(Mono.just(mockGraph));
        when(tourService.generateSecretSantaPairs(mockGraph)).thenReturn(Flux.fromIterable(mockPairs));
        when(emailDeliveryStrategyFactory.getStrategy()).thenReturn(emailDeliveryStrategy);
        when(emailDeliveryStrategy.getStrategyName()).thenReturn("test-strategy");
        when(emailDeliveryStrategy.deliverEmails(mockPairs, request.getMappings()))
                .thenReturn(Mono.error(new RuntimeException("Service unavailable")));
        when(responseBuilder.buildResponseWithEmail(any(), any())).thenReturn(expectedResponse);
        
        // when & then
        StepVerifier.create(orchestrationService.processSecretSantaRequest(request))
                .assertNext(response -> {
                    assertEquals(1, response.getPairs().size());
                    assertEquals(EmailStatus.FAILED, response.getEmailStatus());
                    assertFalse(response.isSuccess());
                    assertTrue(response.hasErrors());
                })
                .verifyComplete();
    }
    
    @Test
    void shouldHandleGraphGenerationFailure() {
        // given
        SecretSantaRequest request = createTestRequest(false);
        SecretSantaResponse failedResponse = SecretSantaResponse.failed(
            List.of("Secret Santa generation failed: Invalid graph data")
        );
        
        when(graphMappingService.generateGraph(request))
                .thenReturn(Mono.error(new RuntimeException("Invalid graph data")));
        when(responseBuilder.buildFailedResponse(any(Throwable.class))).thenReturn(failedResponse);
        
        // when & then
        StepVerifier.create(orchestrationService.processSecretSantaRequest(request))
                .assertNext(response -> {
                    assertTrue(response.getPairs().isEmpty());
                    assertEquals(EmailStatus.FAILED, response.getEmailStatus());
                    assertTrue(response.hasErrors());
                    assertTrue(response.getErrors().get(0).contains("Invalid graph data"));
                })
                .verifyComplete();
    }
    
    @Test
    void shouldProcessRequestWithSpecificDeliveryMode() {
        // given
        SecretSantaRequest request = createTestRequest(true);
        Graph mockGraph = createMockGraph();
        List<Pair> mockPairs = List.of(
            new Pair("alice@example.com", "bob@example.com")
        );
        EmailDeliveryResult deliveryResult = EmailDeliveryResult.pending(
            Map.of("alice@example.com", EmailResult.PENDING)
        );
        SecretSantaResponse expectedResponse = SecretSantaResponse.withEmail(
            mockPairs, EmailStatus.PENDING, Map.of("alice@example.com", EmailResult.PENDING), List.of()
        );
        
        when(graphMappingService.generateGraph(request)).thenReturn(Mono.just(mockGraph));
        when(tourService.generateSecretSantaPairs(mockGraph)).thenReturn(Flux.fromIterable(mockPairs));
        when(emailDeliveryStrategyFactory.getStrategy("async")).thenReturn(emailDeliveryStrategy);
        when(emailDeliveryStrategy.getStrategyName()).thenReturn("asynchronous");
        when(emailDeliveryStrategy.deliverEmails(mockPairs, request.getMappings()))
                .thenReturn(Mono.just(deliveryResult));
        when(responseBuilder.buildResponseWithEmail(mockPairs, deliveryResult)).thenReturn(expectedResponse);
        
        // when & then
        StepVerifier.create(orchestrationService.processSecretSantaRequest(request, "async"))
                .assertNext(response -> {
                    assertEquals(1, response.getPairs().size());
                    assertEquals(EmailStatus.PENDING, response.getEmailStatus());
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
    
    private Graph createMockGraph() {
        return new Graph(Map.of(
            new Vertex("alice@example.com"), List.of(new Vertex("bob@example.com")),
            new Vertex("bob@example.com"), List.of(new Vertex("alice@example.com"))
        ));
    }
}