package com.balazs.hajdu.secretsanta.domain.response;

/**
 * Represents the delivery status of an individual email
 */
public enum EmailResult {
    /**
     * Email was successfully delivered
     */
    DELIVERED,
    
    /**
     * Email delivery failed after all retry attempts
     */
    FAILED,
    
    /**
     * Email delivery is still being attempted
     */
    PENDING,
    
    /**
     * Email was skipped (e.g., invalid address, disabled)
     */
    SKIPPED
}