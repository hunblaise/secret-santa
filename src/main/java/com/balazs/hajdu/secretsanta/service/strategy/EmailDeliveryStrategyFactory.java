package com.balazs.hajdu.secretsanta.service.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Factory responsible for selecting the appropriate email delivery strategy
 * based on configuration and runtime conditions.
 */
@Component
public class EmailDeliveryStrategyFactory {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(EmailDeliveryStrategyFactory.class);
    
    private final SynchronousEmailDeliveryStrategy synchronousStrategy;
    private final AsynchronousEmailDeliveryStrategy asynchronousStrategy;
    
    @Value("${secret-santa.email.delivery.mode:sync}")
    private String defaultDeliveryMode;
    
    @Autowired
    public EmailDeliveryStrategyFactory(SynchronousEmailDeliveryStrategy synchronousStrategy,
                                      AsynchronousEmailDeliveryStrategy asynchronousStrategy) {
        this.synchronousStrategy = synchronousStrategy;
        this.asynchronousStrategy = asynchronousStrategy;
    }
    
    /**
     * Get the email delivery strategy based on the configured delivery mode.
     * 
     * @return The appropriate email delivery strategy
     */
    public EmailDeliveryStrategy getStrategy() {
        return getStrategy(defaultDeliveryMode);
    }
    
    /**
     * Get the email delivery strategy for a specific delivery mode.
     * 
     * @param deliveryMode The desired delivery mode ("sync", "async", etc.)
     * @return The appropriate email delivery strategy
     */
    public EmailDeliveryStrategy getStrategy(String deliveryMode) {
        if (deliveryMode == null || deliveryMode.trim().isEmpty()) {
            LOGGER.debug("No delivery mode specified, using default synchronous strategy");
            return synchronousStrategy;
        }
        
        String normalizedMode = deliveryMode.trim().toLowerCase();
        
        return switch (normalizedMode) {
            case "async", "asynchronous" -> {
                LOGGER.debug("Selected asynchronous email delivery strategy");
                yield asynchronousStrategy;
            }
            case "sync", "synchronous" -> {
                LOGGER.debug("Selected synchronous email delivery strategy");
                yield synchronousStrategy;
            }
            default -> {
                LOGGER.warn("Unknown delivery mode '{}', defaulting to synchronous strategy", deliveryMode);
                yield synchronousStrategy;
            }
        };
    }
    
    /**
     * Check if a specific delivery mode is supported.
     * 
     * @param deliveryMode The delivery mode to check
     * @return true if the mode is supported, false otherwise
     */
    public boolean isDeliveryModeSupported(String deliveryMode) {
        if (deliveryMode == null || deliveryMode.trim().isEmpty()) {
            return true; // Default mode is always supported
        }
        
        String normalizedMode = deliveryMode.trim().toLowerCase();
        return normalizedMode.equals("sync") || 
               normalizedMode.equals("synchronous") ||
               normalizedMode.equals("async") || 
               normalizedMode.equals("asynchronous");
    }
    
    /**
     * Get the configured default delivery mode.
     * 
     * @return The default delivery mode
     */
    public String getDefaultDeliveryMode() {
        return defaultDeliveryMode;
    }
}