package com.balazs.hajdu.secretsanta.controller;

import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import com.balazs.hajdu.secretsanta.domain.response.SecretSantaResponse;
import com.balazs.hajdu.secretsanta.service.SecretSantaOrchestrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * @author Balazs_Hajdu
 */
@RestController
public class SecretSantaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecretSantaController.class);
    private static final String GENERATE_PAIRS = "/generatePairs";

    private final SecretSantaOrchestrationService orchestrationService;

    @Autowired
    public SecretSantaController(SecretSantaOrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    @PostMapping(GENERATE_PAIRS)
    public Mono<SecretSantaResponse> generateSecretSantaPairs(@RequestBody SecretSantaRequest request) {
        LOGGER.info("Received Secret Santa request for {} participants", 
                   request.getEmails() != null ? request.getEmails().size() : 0);
        
        return orchestrationService.processSecretSantaRequest(request)
                .doOnSuccess(response -> LOGGER.info("Request processing completed successfully"))
                .doOnError(error -> LOGGER.error("Request processing failed: {}", error.getMessage()));
    }

}
