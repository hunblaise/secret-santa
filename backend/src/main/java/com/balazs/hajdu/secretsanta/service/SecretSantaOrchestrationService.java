package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.EmailDeliveryResult;
import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.domain.response.SecretSantaResponse;
import com.balazs.hajdu.secretsanta.service.strategy.EmailDeliveryStrategy;
import com.balazs.hajdu.secretsanta.service.strategy.EmailDeliveryStrategyFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Main orchestration service that coordinates the entire Secret Santa generation process.
 * Handles the business flow from request to response, including graph generation,
 * Hamiltonian tour calculation, and email delivery.
 */
@Service
public class SecretSantaOrchestrationService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(SecretSantaOrchestrationService.class);
    
    private final GraphMappingService graphMappingService;
    private final HamiltonianTourService tourService;
    private final EmailDeliveryStrategyFactory emailDeliveryStrategyFactory;
    private final SecretSantaResponseBuilder responseBuilder;
    
    @Autowired
    public SecretSantaOrchestrationService(GraphMappingService graphMappingService,
                                         HamiltonianTourService tourService,
                                         EmailDeliveryStrategyFactory emailDeliveryStrategyFactory,
                                         SecretSantaResponseBuilder responseBuilder) {
        this.graphMappingService = graphMappingService;
        this.tourService = tourService;
        this.emailDeliveryStrategyFactory = emailDeliveryStrategyFactory;
        this.responseBuilder = responseBuilder;
    }
    
    /**
     * Process a complete Secret Santa request from generation to email delivery.
     * 
     * @param request The Secret Santa request containing participants and configuration
     * @return Mono containing the complete response with pairs and email status
     */
    public Mono<SecretSantaResponse> processSecretSantaRequest(SecretSantaRequest request) {
        LOGGER.info("Processing Secret Santa request for {} participants", 
                   request.getEmails() != null ? request.getEmails().size() : 0);
        
        return generateSecretSantaPairs(request)
                .flatMap(pairs -> processEmailDeliveryIfEnabled(request, pairs))
                .doOnSuccess(response -> LOGGER.info("Secret Santa request completed: {}", response.getSummary()))
                .onErrorResume(this::handleError);
    }
    
    /**
     * Generate Secret Santa pairs using graph theory algorithm.
     */
    private Mono<List<Pair>> generateSecretSantaPairs(SecretSantaRequest request) {
        LOGGER.debug("Generating Secret Santa pairs");
        
        return Mono.just(request)
                .flatMap(graphMappingService::generateGraph)
                .flatMapMany(tourService::generateSecretSantaPairs)
                .collectList()
                .doOnSuccess(pairs -> LOGGER.debug("Generated {} Secret Santa pairs", pairs.size()));
    }
    
    /**
     * Process email delivery if enabled in the request.
     */
    private Mono<SecretSantaResponse> processEmailDeliveryIfEnabled(SecretSantaRequest request, List<Pair> pairs) {
        if (!request.isEmailSendingEnabled()) {
            LOGGER.info("Email delivery disabled, returning pairs only");
            return Mono.just(responseBuilder.buildResponseWithoutEmail(pairs));
        }
        
        return processEmailDelivery(request, pairs);
    }
    
    /**
     * Process email delivery using the appropriate strategy.
     */
    private Mono<SecretSantaResponse> processEmailDelivery(SecretSantaRequest request, List<Pair> pairs) {
        EmailDeliveryStrategy strategy = emailDeliveryStrategyFactory.getStrategy();
        LOGGER.info("Processing email delivery using {} strategy for {} pairs", 
                   strategy.getStrategyName(), pairs.size());
        
        return strategy.deliverEmails(pairs, request.getMappings())
                .map(deliveryResult -> responseBuilder.buildResponseWithEmail(pairs, deliveryResult))
                .onErrorResume(error -> {
                    LOGGER.error("Email delivery failed: {}", error.getMessage());
                    EmailDeliveryResult failedResult = EmailDeliveryResult.failed(
                        java.util.Map.of(), 
                        List.of("Email delivery failed: " + error.getMessage())
                    );
                    return Mono.just(responseBuilder.buildResponseWithEmail(pairs, failedResult));
                });
    }
    
    /**
     * Handle errors in the Secret Santa generation process.
     */
    private Mono<SecretSantaResponse> handleError(Throwable error) {
        LOGGER.error("Error during Secret Santa generation: {}", error.getMessage(), error);
        return Mono.just(responseBuilder.buildFailedResponse(error));
    }
    
    /**
     * Process a Secret Santa request with a specific delivery mode override.
     * This method allows overriding the default delivery mode for specific requests.
     * 
     * @param request The Secret Santa request
     * @param deliveryMode The specific delivery mode to use ("sync" or "async")
     * @return Mono containing the complete response
     */
    public Mono<SecretSantaResponse> processSecretSantaRequest(SecretSantaRequest request, String deliveryMode) {
        LOGGER.info("Processing Secret Santa request with delivery mode override: {}", deliveryMode);
        
        return generateSecretSantaPairs(request)
                .flatMap(pairs -> processEmailDeliveryWithMode(request, pairs, deliveryMode))
                .doOnSuccess(response -> LOGGER.info("Secret Santa request completed: {}", response.getSummary()))
                .onErrorResume(this::handleError);
    }
    
    /**
     * Process email delivery with a specific delivery mode.
     */
    private Mono<SecretSantaResponse> processEmailDeliveryWithMode(SecretSantaRequest request, 
                                                                  List<Pair> pairs, 
                                                                  String deliveryMode) {
        if (!request.isEmailSendingEnabled()) {
            LOGGER.info("Email delivery disabled, returning pairs only");
            return Mono.just(responseBuilder.buildResponseWithoutEmail(pairs));
        }
        
        EmailDeliveryStrategy strategy = emailDeliveryStrategyFactory.getStrategy(deliveryMode);
        LOGGER.info("Processing email delivery using {} strategy for {} pairs", 
                   strategy.getStrategyName(), pairs.size());
        
        return strategy.deliverEmails(pairs, request.getMappings())
                .map(deliveryResult -> responseBuilder.buildResponseWithEmail(pairs, deliveryResult))
                .onErrorResume(error -> {
                    LOGGER.error("Email delivery failed: {}", error.getMessage());
                    EmailDeliveryResult failedResult = EmailDeliveryResult.failed(
                        java.util.Map.of(), 
                        List.of("Email delivery failed: " + error.getMessage())
                    );
                    return Mono.just(responseBuilder.buildResponseWithEmail(pairs, failedResult));
                });
    }
}