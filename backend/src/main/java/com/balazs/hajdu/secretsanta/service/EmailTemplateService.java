package com.balazs.hajdu.secretsanta.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Service for loading and populating email templates.
 * Templates are stored as HTML files in resources/email-templates/ and use
 * simple placeholder substitution with {{PLACEHOLDER}} syntax.
 */
@Service
public class EmailTemplateService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailTemplateService.class);

    private final String secretSantaTemplate;

    public EmailTemplateService() {
        this.secretSantaTemplate = loadTemplate("/email-templates/secret-santa.html");
        LOGGER.info("Email templates loaded successfully");
    }

    /**
     * Builds the Secret Santa email with personalized recipient information.
     *
     * @param recipientName The name of the person receiving the email
     * @param giftRecipient The name of the person they should buy a gift for
     * @return The populated HTML email template
     */
    public String buildSecretSantaEmail(String recipientName, String giftRecipient) {
        return secretSantaTemplate
                .replace("{{RECIPIENT_NAME}}", escapeHtml(recipientName))
                .replace("{{GIFT_RECIPIENT}}", escapeHtml(giftRecipient));
    }

    /**
     * Loads a template file from the classpath.
     *
     * @param templatePath The path to the template resource
     * @return The template content as a String
     * @throws RuntimeException if the template cannot be loaded
     */
    private String loadTemplate(String templatePath) {
        try (InputStream is = getClass().getResourceAsStream(templatePath)) {
            if (is == null) {
                throw new RuntimeException("Template not found: " + templatePath);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load email template: " + templatePath, e);
        }
    }

    /**
     * Escapes HTML special characters to prevent XSS in email content.
     * Only escapes the most critical characters for email context.
     *
     * @param input The input string to escape
     * @return The escaped string safe for HTML
     */
    private String escapeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
