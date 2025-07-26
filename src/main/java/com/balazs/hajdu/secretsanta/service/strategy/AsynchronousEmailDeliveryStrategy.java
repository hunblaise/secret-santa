package com.balazs.hajdu.secretsanta.service.strategy;

import com.balazs.hajdu.secretsanta.domain.EmailDeliveryResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
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
 * Asynchronous email delivery strategy that starts email delivery in the background
 * and returns immediately with pending status. This is a fire-and-forget approach
 * where the caller gets instant response but doesn't wait for email completion.
 */
@Component
public class AsynchronousEmailDeliveryStrategy implements EmailDeliveryStrategy {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(AsynchronousEmailDeliveryStrategy.class);
    
    private final TransactionalMailingService transactionalMailingService;
    
    @Autowired
    public AsynchronousEmailDeliveryStrategy(TransactionalMailingService transactionalMailingService) {
        this.transactionalMailingService = transactionalMailingService;
    }
    
    @Override
    public Mono<EmailDeliveryResult> deliverEmails(List<Pair> pairs, Map<String, String> nameMapping) {
        LOGGER.info("Starting asynchronous email delivery for {} pairs", pairs.size());
        
        // Start async email delivery (fire-and-forget)
        transactionalMailingService.sendAllEmails(pairs, nameMapping)
                .doOnSuccess(results -> LOGGER.info("Async email delivery completed"))
                .doOnError(error -> LOGGER.error("Async email delivery failed: {}", error.getMessage()))
                .subscribe();
        
        // Return immediately with pending status for all emails
        Map<String, EmailResult> pendingResults = pairs.stream()
                .collect(Collectors.toMap(
                    Pair::getFrom, 
                    p -> EmailResult.PENDING
                ));
        
        return Mono.just(EmailDeliveryResult.pending(pendingResults));
    }
    
    @Override
    public String getStrategyName() {
        return "asynchronous";
    }
}