package com.balazs.hajdu.secretsanta.domain.response;

/**
 * Represents the status of email delivery operations
 */
public enum EmailStatus {
    /**
     * Email delivery is in progress or queued
     */
    PENDING,
    
    /**
     * All emails were delivered successfully
     */
    SUCCESS,
    
    /**
     * All email delivery attempts failed
     */
    FAILED,
    
    /**
     * Some emails were delivered, others failed
     */
    PARTIAL,
    
    /**
     * Email delivery was disabled
     */
    DISABLED
}