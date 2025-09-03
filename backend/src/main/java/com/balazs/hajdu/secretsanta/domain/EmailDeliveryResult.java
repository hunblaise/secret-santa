package com.balazs.hajdu.secretsanta.domain;

import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailStatus;

import java.util.List;
import java.util.Map;

/**
 * Value object representing the result of an email delivery operation.
 * Contains the overall status, individual email results, and any errors encountered.
 */
public class EmailDeliveryResult {
    
    private final EmailStatus overallStatus;
    private final Map<String, EmailResult> individualResults;
    private final List<String> errors;
    
    public EmailDeliveryResult(EmailStatus overallStatus, Map<String, EmailResult> individualResults, List<String> errors) {
        this.overallStatus = overallStatus;
        this.individualResults = Map.copyOf(individualResults);
        this.errors = List.copyOf(errors);
    }
    
    /**
     * Create result for successful delivery
     */
    public static EmailDeliveryResult success(Map<String, EmailResult> results) {
        return new EmailDeliveryResult(EmailStatus.SUCCESS, results, List.of());
    }
    
    /**
     * Create result for failed delivery
     */
    public static EmailDeliveryResult failed(Map<String, EmailResult> results, List<String> errors) {
        return new EmailDeliveryResult(EmailStatus.FAILED, results, errors);
    }
    
    /**
     * Create result for partial delivery (some succeeded, some failed)
     */
    public static EmailDeliveryResult partial(Map<String, EmailResult> results, List<String> errors) {
        return new EmailDeliveryResult(EmailStatus.PARTIAL, results, errors);
    }
    
    /**
     * Create result for pending delivery (async mode)
     */
    public static EmailDeliveryResult pending(Map<String, EmailResult> results) {
        return new EmailDeliveryResult(EmailStatus.PENDING, results, List.of());
    }
    
    /**
     * Create result for disabled email delivery
     */
    public static EmailDeliveryResult disabled() {
        return new EmailDeliveryResult(EmailStatus.DISABLED, Map.of(), List.of());
    }
    
    public EmailStatus getOverallStatus() {
        return overallStatus;
    }
    
    public Map<String, EmailResult> getIndividualResults() {
        return individualResults;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    /**
     * Check if the delivery was completely successful
     */
    public boolean isSuccessful() {
        return overallStatus == EmailStatus.SUCCESS;
    }
    
    /**
     * Check if there were any errors
     */
    public boolean hasErrors() {
        return !errors.isEmpty() || overallStatus == EmailStatus.FAILED;
    }
    
    /**
     * Check if delivery is still in progress
     */
    public boolean isPending() {
        return overallStatus == EmailStatus.PENDING;
    }
    
    @Override
    public String toString() {
        return "EmailDeliveryResult{" +
                "overallStatus=" + overallStatus +
                ", individualResults=" + individualResults.size() +
                ", errors=" + errors.size() +
                '}';
    }
}