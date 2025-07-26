package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.EmailDeliveryResult;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.domain.response.SecretSantaResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Builder responsible for creating SecretSantaResponse objects from business operation results.
 * Encapsulates the logic for converting domain objects into appropriate response structures.
 */
@Component
public class SecretSantaResponseBuilder {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(SecretSantaResponseBuilder.class);
    
    /**
     * Build a response when email delivery is disabled.
     * 
     * @param pairs The generated Secret Santa pairs
     * @return Response indicating successful pair generation without email delivery
     */
    public SecretSantaResponse buildResponseWithoutEmail(List<Pair> pairs) {
        LOGGER.debug("Building response without email delivery for {} pairs", pairs.size());
        return SecretSantaResponse.withoutEmail(pairs);
    }
    
    /**
     * Build a response when email delivery was attempted.
     * 
     * @param pairs The generated Secret Santa pairs
     * @param deliveryResult The result of the email delivery operation
     * @return Response containing both pairs and email delivery status
     */
    public SecretSantaResponse buildResponseWithEmail(List<Pair> pairs, EmailDeliveryResult deliveryResult) {
        LOGGER.debug("Building response with email delivery for {} pairs, status: {}", 
                    pairs.size(), deliveryResult.getOverallStatus());
        
        return SecretSantaResponse.withEmail(
            pairs,
            deliveryResult.getOverallStatus(),
            deliveryResult.getIndividualResults(),
            deliveryResult.getErrors()
        );
    }
    
    /**
     * Build a response for failed Secret Santa generation.
     * 
     * @param error The error that caused the failure
     * @return Response indicating failure with error details
     */
    public SecretSantaResponse buildFailedResponse(Throwable error) {
        String errorMessage = "Secret Santa generation failed: " + error.getMessage();
        LOGGER.error("Building failed response: {}", errorMessage);
        
        return SecretSantaResponse.failed(List.of(errorMessage));
    }
    
    /**
     * Build a response for failed Secret Santa generation with custom error messages.
     * 
     * @param errors List of error messages
     * @return Response indicating failure with error details
     */
    public SecretSantaResponse buildFailedResponse(List<String> errors) {
        LOGGER.error("Building failed response with {} errors", errors.size());
        return SecretSantaResponse.failed(errors);
    }
    
    /**
     * Build a response when email delivery was requested but email service is not available.
     * 
     * @param pairs The generated Secret Santa pairs
     * @return Response with pairs but indicating email delivery failure
     */
    public SecretSantaResponse buildResponseWithEmailServiceUnavailable(List<Pair> pairs) {
        LOGGER.warn("Email service unavailable, returning pairs without email delivery");
        
        List<String> errors = List.of("Email service is not available. Pairs generated successfully but emails could not be sent.");
        return SecretSantaResponse.withEmail(
            pairs,
            com.balazs.hajdu.secretsanta.domain.response.EmailStatus.FAILED,
            java.util.Map.of(),
            errors
        );
    }
}