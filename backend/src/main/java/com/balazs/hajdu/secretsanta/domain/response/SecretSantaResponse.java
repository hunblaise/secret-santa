package com.balazs.hajdu.secretsanta.domain.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Enhanced response for Secret Santa operations that includes both
 * the generated pairs and the status of email delivery operations.
 */
public class SecretSantaResponse {
    
    private final List<Pair> pairs;
    private final EmailStatus emailStatus;
    private final Map<String, EmailResult> emailResults;
    private final List<String> errors;
    private final LocalDateTime timestamp;
    
    public SecretSantaResponse(List<Pair> pairs, EmailStatus emailStatus, 
                              Map<String, EmailResult> emailResults, List<String> errors) {
        this.pairs = pairs;
        this.emailStatus = emailStatus;
        this.emailResults = emailResults;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }
    
    /**
     * Create response for successful operation without email sending
     */
    public static SecretSantaResponse withoutEmail(List<Pair> pairs) {
        return new SecretSantaResponse(pairs, EmailStatus.DISABLED, Map.of(), List.of());
    }
    
    /**
     * Create response for successful operation with email sending
     */
    public static SecretSantaResponse withEmail(List<Pair> pairs, EmailStatus emailStatus, 
                                               Map<String, EmailResult> emailResults, List<String> errors) {
        return new SecretSantaResponse(pairs, emailStatus, emailResults, errors);
    }
    
    /**
     * Create response for failed operation
     */
    public static SecretSantaResponse failed(List<String> errors) {
        return new SecretSantaResponse(List.of(), EmailStatus.FAILED, Map.of(), errors);
    }
    
    public List<Pair> getPairs() {
        return pairs;
    }
    
    public EmailStatus getEmailStatus() {
        return emailStatus;
    }
    
    public Map<String, EmailResult> getEmailResults() {
        return emailResults;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    /**
     * Check if the operation was completely successful
     */
    public boolean isSuccess() {
        return !pairs.isEmpty() && 
               (emailStatus == EmailStatus.SUCCESS || emailStatus == EmailStatus.DISABLED);
    }
    
    /**
     * Check if there were any errors in the operation
     */
    public boolean hasErrors() {
        return !errors.isEmpty() || emailStatus == EmailStatus.FAILED;
    }
    
    /**
     * Get a summary of the operation
     */
    public String getSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("Generated ").append(pairs.size()).append(" Secret Santa pairs. ");
        
        switch (emailStatus) {
            case SUCCESS -> summary.append("All emails delivered successfully.");
            case FAILED -> summary.append("Email delivery failed.");
            case PARTIAL -> summary.append("Some emails failed to deliver.");
            case DISABLED -> summary.append("Email delivery was disabled.");
            case PENDING -> summary.append("Email delivery in progress.");
        }
        
        return summary.toString();
    }
    
    @Override
    public String toString() {
        return "SecretSantaResponse{" +
                "pairs=" + pairs.size() +
                ", emailStatus=" + emailStatus +
                ", emailResults=" + emailResults.size() +
                ", errors=" + errors.size() +
                ", timestamp=" + timestamp +
                '}';
    }
}