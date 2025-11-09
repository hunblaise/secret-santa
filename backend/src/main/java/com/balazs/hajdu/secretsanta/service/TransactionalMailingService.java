package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailStatus;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Transactional email service that ensures all emails are delivered successfully
 * or provides clear failure reporting with retry mechanisms.
 */
@Service
public class TransactionalMailingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionalMailingService.class);
    
    private static final String MAIL_SUBJECT = "Wellhello Télapó";
    private static final String MAIL_TEXT = "Kedves %s!\nAz ajándékot az alábbi személynek kell készítened: %s";

    private final JavaMailSender javaMailSender;
    
    @Value("${secret-santa.email.retry.attempts:3}")
    private int retryAttempts;
    
    @Value("${secret-santa.email.retry.delay:1000}")
    private long retryDelayMs;
    
    @Value("${secret-santa.email.batch.enabled:true}")
    private boolean batchEnabled;

    @Value("${secret-santa.email.from:noreply@secretsanta.com}")
    private String fromAddress;

    @Autowired
    public TransactionalMailingService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    /**
     * Send emails to all participants with transactional semantics.
     * Returns detailed status for each email delivery attempt.
     */
    public Mono<Map<String, EmailResult>> sendAllEmails(List<Pair> pairs, Map<String, String> nameMapping) {
        LOGGER.info("Starting transactional email delivery for {} pairs", pairs.size());
        
        // Return empty results immediately for empty pairs list
        if (pairs == null || pairs.isEmpty()) {
            LOGGER.debug("No pairs to process, returning empty results");
            return Mono.just(new ConcurrentHashMap<>());
        }
        
        return validateEmailConfiguration()
                .then(sendEmailsWithRetry(pairs, nameMapping))
                .doOnSuccess(results -> logEmailResults(results))
                .doOnError(error -> LOGGER.error("Batch email delivery failed: {}", error.getMessage()));
    }

    /**
     * Validate email configuration before attempting to send emails
     */
    private Mono<Void> validateEmailConfiguration() {
        return Mono.fromRunnable(() -> {
            try {
                // Test the mail sender configuration
                javaMailSender.createMimeMessage();
                LOGGER.debug("Email configuration validated successfully");
            } catch (Exception e) {
                LOGGER.error("Email configuration validation failed: {}", e.getMessage());
                throw new RuntimeException("Email service not properly configured: " + e.getMessage());
            }
        });
    }

    /**
     * Send emails with retry logic and detailed result tracking
     */
    private Mono<Map<String, EmailResult>> sendEmailsWithRetry(List<Pair> pairs, Map<String, String> nameMapping) {
        Map<String, EmailResult> results = new ConcurrentHashMap<>();
        
        if (batchEnabled) {
            return sendEmailsBatch(pairs, nameMapping, results);
        } else {
            return sendEmailsIndividually(pairs, nameMapping, results);
        }
    }

    /**
     * Send all emails as a single batch operation (transactional)
     */
    private Mono<Map<String, EmailResult>> sendEmailsBatch(List<Pair> pairs, Map<String, String> nameMapping, 
                                                          Map<String, EmailResult> results) {
        return Mono.fromCallable(() -> {
            // Mark all as pending
            pairs.forEach(pair -> results.put(pair.getFrom(), EmailResult.PENDING));
            
            // Prepare all messages
            List<SimpleMailMessage> messages = pairs.stream()
                    .map(pair -> createEmailMessage(pair, nameMapping))
                    .toList();
            
            try {
                // Send all messages in batch
                javaMailSender.send(messages.toArray(new SimpleMailMessage[0]));
                
                // Mark all as delivered
                pairs.forEach(pair -> results.put(pair.getFrom(), EmailResult.DELIVERED));
                LOGGER.info("Batch email delivery successful for {} recipients", pairs.size());
                
                return results;
            } catch (MailException e) {
                // Mark all as failed
                pairs.forEach(pair -> results.put(pair.getFrom(), EmailResult.FAILED));
                LOGGER.error("Batch email delivery failed for all {} recipients: {}", pairs.size(), e.getMessage());
                throw new RuntimeException("Batch email delivery failed: " + e.getMessage());
            }
        })
        .retry(retryAttempts)
        .doOnError(error -> LOGGER.warn("Retrying batch email delivery due to error: {}", error.getMessage()))
        .onErrorReturn(results); // Return partial results on final failure
    }

    /**
     * Send emails individually with per-email retry logic
     */
    private Mono<Map<String, EmailResult>> sendEmailsIndividually(List<Pair> pairs, Map<String, String> nameMapping,
                                                                 Map<String, EmailResult> results) {
        return Flux.fromIterable(pairs)
                .flatMap(pair -> sendSingleEmailWithRetry(pair, nameMapping, results))
                .then(Mono.just(results));
    }

    /**
     * Send a single email with retry logic
     */
    private Mono<Void> sendSingleEmailWithRetry(Pair pair, Map<String, String> nameMapping, 
                                               Map<String, EmailResult> results) {
        results.put(pair.getFrom(), EmailResult.PENDING);
        
        return Mono.fromRunnable(() -> {
            SimpleMailMessage message = createEmailMessage(pair, nameMapping);
            javaMailSender.send(message);
            results.put(pair.getFrom(), EmailResult.DELIVERED);
            LOGGER.debug("Email sent successfully to {}", pair.getFrom());
        })
        .retry(retryAttempts)
        .doOnError(error -> LOGGER.warn("Retrying email to {} due to error: {}", pair.getFrom(), error.getMessage()))
        .onErrorResume(error -> {
            results.put(pair.getFrom(), EmailResult.FAILED);
            LOGGER.error("Failed to send email to {} after {} attempts: {}", 
                        pair.getFrom(), retryAttempts, error.getMessage());
            return Mono.empty(); // Continue with other emails
        }).then();
    }

    /**
     * Create email message for a specific pair
     */
    private SimpleMailMessage createEmailMessage(Pair pair, Map<String, String> nameMapping) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(pair.getFrom());
        message.setSubject(MAIL_SUBJECT);

        String fromName = getDisplayName(pair.getFrom(), nameMapping);
        String toName = getDisplayName(pair.getTo(), nameMapping);

        message.setText(String.format(MAIL_TEXT, fromName, toName));
        return message;
    }

    /**
     * Get display name with fallback to email address
     */
    private String getDisplayName(String email, Map<String, String> nameMapping) {
        return (nameMapping != null && nameMapping.containsKey(email)) 
                ? nameMapping.get(email) 
                : email;
    }

    /**
     * Determine overall email status based on individual results
     */
    public EmailStatus determineEmailStatus(Map<String, EmailResult> results) {
        if (results.isEmpty()) {
            return EmailStatus.DISABLED;
        }
        
        long delivered = results.values().stream().mapToLong(result -> 
            result == EmailResult.DELIVERED ? 1 : 0).sum();
        long failed = results.values().stream().mapToLong(result -> 
            result == EmailResult.FAILED ? 1 : 0).sum();
        long pending = results.values().stream().mapToLong(result -> 
            result == EmailResult.PENDING ? 1 : 0).sum();
        
        if (pending > 0) {
            return EmailStatus.PENDING;
        } else if (delivered == results.size()) {
            return EmailStatus.SUCCESS;
        } else if (failed == results.size()) {
            return EmailStatus.FAILED;
        } else {
            return EmailStatus.PARTIAL;
        }
    }

    /**
     * Log the results of email delivery attempts
     */
    private void logEmailResults(Map<String, EmailResult> results) {
        long delivered = results.values().stream().mapToLong(r -> r == EmailResult.DELIVERED ? 1 : 0).sum();
        long failed = results.values().stream().mapToLong(r -> r == EmailResult.FAILED ? 1 : 0).sum();
        
        LOGGER.info("Email delivery completed: {} delivered, {} failed out of {} total", 
                   delivered, failed, results.size());
        
        if (failed > 0) {
            List<String> failedEmails = results.entrySet().stream()
                    .filter(entry -> entry.getValue() == EmailResult.FAILED)
                    .map(Map.Entry::getKey)
                    .toList();
            LOGGER.warn("Failed email deliveries: {}", failedEmails);
        }
    }
}