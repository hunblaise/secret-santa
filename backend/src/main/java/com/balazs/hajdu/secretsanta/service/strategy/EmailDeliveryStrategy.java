package com.balazs.hajdu.secretsanta.service.strategy;

import com.balazs.hajdu.secretsanta.domain.EmailDeliveryResult;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Strategy interface for different email delivery approaches.
 * Implementations can handle synchronous, asynchronous, or other delivery patterns.
 */
public interface EmailDeliveryStrategy {
    
    /**
     * Deliver emails to all Secret Santa participants.
     * 
     * @param pairs The Secret Santa pairs (giver -> recipient)
     * @param nameMapping Mapping from email addresses to display names (optional)
     * @return Mono containing the delivery result with status and individual results
     */
    Mono<EmailDeliveryResult> deliverEmails(List<Pair> pairs, Map<String, String> nameMapping);
    
    /**
     * Get the name/type of this delivery strategy for logging and debugging.
     * 
     * @return A descriptive name for this strategy (e.g., "synchronous", "asynchronous")
     */
    String getStrategyName();
    
    /**
     * Check if this strategy is suitable for the given configuration.
     * Can be used by factories to determine strategy eligibility.
     * 
     * @return true if this strategy can be used in the current environment
     */
    default boolean isAvailable() {
        return true;
    }
}