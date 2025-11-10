package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailStatus;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Transactional email service using Resend HTTP API for reliable email delivery.
 * Ensures all emails are delivered successfully or provides clear failure reporting with retry mechanisms.
 */
@Service
public class TransactionalMailingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionalMailingService.class);

    private static final String MAIL_SUBJECT = "Wellhello Télapó";
    private static final String MAIL_TEXT = "Kedves %s!\nAz ajándékot az alábbi személynek kell készítened: %s";

    private final EmailTemplateService emailTemplateService;
    private final Resend resendClient;

    @Value("${secret-santa.email.retry.attempts:3}")
    private int retryAttempts;

    @Value("${secret-santa.email.retry.delay:1000}")
    private long retryDelayMs;

    @Value("${secret-santa.email.batch.enabled:true}")
    private boolean batchEnabled;

    @Value("${secret-santa.email.from:noreply@secretsanta.com}")
    private String fromAddress;

    public TransactionalMailingService(@Value("${resend.api.key}") String resendApiKey,
                                      EmailTemplateService emailTemplateService) {
        this.resendClient = new Resend(resendApiKey);
        this.emailTemplateService = emailTemplateService;
        LOGGER.info("Resend client initialized with API key");
    }

    /**
     * Send emails to all participants with transactional semantics.
     * Returns detailed status for each email delivery attempt.
     */
    public Mono<Map<String, EmailResult>> sendAllEmails(List<Pair> pairs, Map<String, String> nameMapping) {
        LOGGER.info("Starting transactional email delivery for {} pairs using Resend HTTP API", pairs.size());

        // Return empty results immediately for empty pairs list
        if (pairs == null || pairs.isEmpty()) {
            LOGGER.debug("No pairs to process, returning empty results");
            return Mono.just(new ConcurrentHashMap<>());
        }

        return sendEmailsWithRetry(pairs, nameMapping)
                .doOnSuccess(this::logEmailResults)
                .doOnError(error -> LOGGER.error("Batch email delivery failed: {}", error.getMessage()));
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
     * Send all emails as a batch operation (each with retry)
     */
    private Mono<Map<String, EmailResult>> sendEmailsBatch(List<Pair> pairs, Map<String, String> nameMapping,
                                                          Map<String, EmailResult> results) {
        LOGGER.debug("Sending {} emails in batch mode (individual requests with retry)", pairs.size());

        return Flux.fromIterable(pairs)
                .flatMap(pair -> sendSingleEmailWithRetry(pair, nameMapping, results))
                .then(Mono.just(results));
    }

    /**
     * Send emails individually with per-email retry logic
     */
    private Mono<Map<String, EmailResult>> sendEmailsIndividually(List<Pair> pairs, Map<String, String> nameMapping,
                                                                 Map<String, EmailResult> results) {
        LOGGER.debug("Sending {} emails individually with retry", pairs.size());

        return Flux.fromIterable(pairs)
                .flatMap(pair -> sendSingleEmailWithRetry(pair, nameMapping, results))
                .then(Mono.just(results));
    }

    /**
     * Send a single email using Resend API with retry logic
     */
    private Mono<Void> sendSingleEmailWithRetry(Pair pair, Map<String, String> nameMapping,
                                               Map<String, EmailResult> results) {
        results.put(pair.getFrom(), EmailResult.PENDING);

        return Mono.fromCallable(() -> {
            String fromName = getDisplayName(pair.getFrom(), nameMapping);
            String toName = getDisplayName(pair.getTo(), nameMapping);

            // Plain text version for fallback
            String emailText = String.format(MAIL_TEXT, fromName, toName);

            // HTML version with beautiful Christmas design from external template
            String emailHtml = emailTemplateService.buildSecretSantaEmail(fromName, toName);

            CreateEmailOptions emailOptions = CreateEmailOptions.builder()
                    .from(fromAddress)
                    .to(pair.getFrom())
                    .subject(MAIL_SUBJECT)
                    .html(emailHtml)
                    .text(emailText)
                    .build();

            try {
                CreateEmailResponse response = resendClient.emails().send(emailOptions);
                results.put(pair.getFrom(), EmailResult.DELIVERED);
                LOGGER.debug("Email sent successfully to {} (ID: {})", pair.getFrom(), response.getId());
                return response;
            } catch (ResendException e) {
                LOGGER.error("Failed to send email to {}: {}", pair.getFrom(), e.getMessage());
                throw new RuntimeException("Resend API error: " + e.getMessage(), e);
            }
        })
        .retry(retryAttempts)
        .doOnError(error -> LOGGER.warn("Retrying email to {} due to error: {}", pair.getFrom(), error.getMessage()))
        .onErrorResume(error -> {
            results.put(pair.getFrom(), EmailResult.FAILED);
            LOGGER.error("Failed to send email to {} after {} attempts: {}",
                        pair.getFrom(), retryAttempts, error.getMessage());
            return Mono.empty(); // Continue with other emails
        })
        .then();
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
