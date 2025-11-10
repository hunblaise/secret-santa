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

    // HTML email template matching frontend Christmas design system
    private static final String MAIL_HTML_TEMPLATE = """
            <!DOCTYPE html>
            <html lang="hu">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Secret Santa</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #FFFFFF 0%%, #F9F7F4 100%); -webkit-font-smoothing: antialiased;">
                <table role="presentation" style="width: 100%%; border-collapse: collapse; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" style="max-width: 600px; width: 100%%; border-collapse: collapse; background: linear-gradient(to bottom, rgba(244, 240, 187, 0.15) 0%%, rgba(255, 255, 255, 0.95) 100%%%%); border-radius: 16px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(255, 255, 255, 0.08) inset; overflow: hidden;">
                                <!-- Header with festive gradient -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #DA2C38 0%%, #87C38F 100%%%%); padding: 32px 24px; text-align: center;">
                                        <!-- Yeti Emoji -->
                                        <div style="font-size: 64px; margin-bottom: 16px; line-height: 1;">
                                            🎅
                                        </div>
                                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #FFFFFF; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                            Secret Santa
                                        </h1>
                                        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.95); font-weight: 500;">
                                            Mikulás ajándékozás
                                        </p>
                                    </td>
                                </tr>

                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 40px 32px;">
                                        <!-- Greeting -->
                                        <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #43291F; line-height: 1.4;">
                                            Kedves %s!
                                        </h2>

                                        <!-- Message -->
                                        <p style="margin: 0 0 32px 0; font-size: 16px; color: #6B5B52; line-height: 1.6;">
                                            Az ajándékot az alábbi személynek kell készítened:
                                        </p>

                                        <!-- Recipient Card -->
                                        <table role="presentation" style="width: 100%%; border-collapse: collapse; background: linear-gradient(to bottom right, rgba(135, 195, 143, 0.12) 0%%, rgba(244, 240, 187, 0.08) 100%%%%); border: 2px solid #87C38F; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(255, 255, 255, 0.1) inset;">
                                            <tr>
                                                <td align="center">
                                                    <div style="display: inline-block; background: linear-gradient(135deg, #DA2C38 0%%, #87C38F 100%%%%); color: #FFFFFF; font-size: 32px; width: 56px; height: 56px; border-radius: 50%%%%; line-height: 56px; text-align: center; margin-bottom: 16px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);">
                                                        🎁
                                                    </div>
                                                    <h3 style="margin: 0; font-size: 28px; font-weight: 700; color: #43291F; line-height: 1.3;">
                                                        %s
                                                    </h3>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Closing Message -->
                                        <p style="margin: 32px 0 0 0; font-size: 15px; color: #6B5B52; line-height: 1.6; text-align: center; font-style: italic;">
                                            Boldog ünnepeket! 🎄✨
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="background: linear-gradient(to bottom, rgba(67, 41, 31, 0.03) 0%%, rgba(67, 41, 31, 0.06) 100%%%%); padding: 24px 32px; text-align: center; border-top: 1px solid rgba(67, 41, 31, 0.1);">
                                        <p style="margin: 0; font-size: 13px; color: #6B5B52; line-height: 1.5;">
                                            Ez egy automatikusan generált üzenet a Secret Santa rendszerből.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;

    private final Resend resendClient;

    @Value("${secret-santa.email.retry.attempts:3}")
    private int retryAttempts;

    @Value("${secret-santa.email.retry.delay:1000}")
    private long retryDelayMs;

    @Value("${secret-santa.email.batch.enabled:true}")
    private boolean batchEnabled;

    @Value("${secret-santa.email.from:noreply@secretsanta.com}")
    private String fromAddress;

    public TransactionalMailingService(@Value("${resend.api.key}") String resendApiKey) {
        this.resendClient = new Resend(resendApiKey);
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
                .doOnSuccess(results -> logEmailResults(results))
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

            // HTML version with beautiful Christmas design
            String emailHtml = String.format(MAIL_HTML_TEMPLATE, fromName, toName);

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
