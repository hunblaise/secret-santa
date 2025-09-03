package com.balazs.hajdu.secretsanta.service.strategy;

import com.balazs.hajdu.secretsanta.domain.EmailDeliveryResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailStatus;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.service.TransactionalMailingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Synchronous email delivery strategy that waits for all emails to complete
 * before returning the result. Provides transactional behavior where you know
 * the final status of all email deliveries.
 */
@Component
public class SynchronousEmailDeliveryStrategy implements EmailDeliveryStrategy {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(SynchronousEmailDeliveryStrategy.class);
    
    private final TransactionalMailingService transactionalMailingService;
    
    @Autowired
    public SynchronousEmailDeliveryStrategy(TransactionalMailingService transactionalMailingService) {
        this.transactionalMailingService = transactionalMailingService;
    }
    
    @Override
    public Mono<EmailDeliveryResult> deliverEmails(List<Pair> pairs, Map<String, String> nameMapping) {
        LOGGER.info("Starting synchronous email delivery for {} pairs", pairs.size());
        
        return transactionalMailingService.sendAllEmails(pairs, nameMapping)
                .map(emailResults -> {
                    EmailStatus emailStatus = transactionalMailingService.determineEmailStatus(emailResults);
                    List<String> errors = collectEmailErrors(emailResults);
                    
                    return createDeliveryResult(emailStatus, emailResults, errors);
                })
                .onErrorResume(error -> {
                    LOGGER.error("Synchronous email delivery failed: {}", error.getMessage());
                    Map<String, EmailResult> failedResults = pairs.stream()
                            .collect(Collectors.toMap(
                                Pair::getFrom, 
                                p -> EmailResult.FAILED
                            ));
                    
                    List<String> errors = List.of("Email delivery failed: " + error.getMessage());
                    return Mono.just(EmailDeliveryResult.failed(failedResults, errors));
                });
    }
    
    @Override
    public String getStrategyName() {
        return "synchronous";
    }
    
    /**
     * Create the appropriate EmailDeliveryResult based on the email status
     */
    private EmailDeliveryResult createDeliveryResult(EmailStatus emailStatus, 
                                                   Map<String, EmailResult> emailResults, 
                                                   List<String> errors) {
        return switch (emailStatus) {
            case SUCCESS -> EmailDeliveryResult.success(emailResults);
            case FAILED -> EmailDeliveryResult.failed(emailResults, errors);
            case PARTIAL -> EmailDeliveryResult.partial(emailResults, errors);
            case PENDING -> EmailDeliveryResult.pending(emailResults);
            case DISABLED -> EmailDeliveryResult.disabled();
        };
    }
    
    /**
     * Collect error messages from email results
     */
    private List<String> collectEmailErrors(Map<String, EmailResult> emailResults) {
        return emailResults.entrySet().stream()
                .filter(entry -> entry.getValue() == EmailResult.FAILED)
                .map(entry -> "Failed to deliver email to: " + entry.getKey())
                .toList();
    }
}