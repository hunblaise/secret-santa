package com.balazs.hajdu.secretsanta.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for EmailTemplateService.
 * Tests template loading, placeholder substitution, and HTML escaping.
 */
class EmailTemplateServiceTest {

    private EmailTemplateService emailTemplateService;

    @BeforeEach
    void setUp() {
        emailTemplateService = new EmailTemplateService();
    }

    @Test
    void shouldLoadTemplateSuccessfully() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertTrue(result.contains("<!DOCTYPE html>"), "Should contain HTML doctype");
        assertTrue(result.contains("</html>"), "Should be valid HTML with closing tag");
    }

    @Test
    void shouldReplaceRecipientNamePlaceholder() {
        // Given
        String recipientName = "John Doe";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(recipientName, "Jane");

        // Then
        assertTrue(result.contains("Kedves " + recipientName + "!"),
                "Should replace {{RECIPIENT_NAME}} with actual name");
        assertFalse(result.contains("{{RECIPIENT_NAME}}"),
                "Should not contain unreplaced placeholder");
    }

    @Test
    void shouldReplaceGiftRecipientPlaceholder() {
        // Given
        String giftRecipient = "Jane Smith";

        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", giftRecipient);

        // Then
        assertTrue(result.contains(giftRecipient),
                "Should replace {{GIFT_RECIPIENT}} with actual name");
        assertFalse(result.contains("{{GIFT_RECIPIENT}}"),
                "Should not contain unreplaced placeholder");
    }

    @Test
    void shouldReplaceBothPlaceholders() {
        // Given
        String recipientName = "Alice";
        String giftRecipient = "Bob";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(recipientName, giftRecipient);

        // Then
        assertTrue(result.contains("Kedves " + recipientName + "!"));
        assertTrue(result.contains(giftRecipient));
        assertFalse(result.contains("{{RECIPIENT_NAME}}"));
        assertFalse(result.contains("{{GIFT_RECIPIENT}}"));
    }

    @Test
    void shouldEscapeHtmlSpecialCharacters() {
        // Given - names with HTML special characters
        String recipientName = "<script>alert('xss')</script>";
        String giftRecipient = "Jane & John's <Gift>";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(recipientName, giftRecipient);

        // Then
        assertFalse(result.contains("<script>"),
                "Should escape < and > characters");
        assertTrue(result.contains("&lt;script&gt;"),
                "Should use HTML entities for < and >");
        assertTrue(result.contains("&amp;"),
                "Should escape & character");
        assertTrue(result.contains("&#x27;"),
                "Should escape single quotes");
        assertFalse(result.contains("Jane & John's <Gift>"),
                "Should not contain unescaped special characters");
    }

    @Test
    void shouldHandleAmpersandEscaping() {
        // Given
        String name = "Smith & Jones";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(name, "Recipient");

        // Then
        assertTrue(result.contains("Smith &amp; Jones"),
                "Should escape ampersands");
    }

    @Test
    void shouldHandleLessThanAndGreaterThanEscaping() {
        // Given
        String name = "Name <Test>";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(name, "Recipient");

        // Then
        assertTrue(result.contains("&lt;") && result.contains("&gt;"),
                "Should escape < and > characters");
        assertFalse(result.contains("<Test>"),
                "Should not contain unescaped HTML tags");
    }

    @Test
    void shouldHandleQuoteEscaping() {
        // Given
        String name = "John \"The Giant\" Doe";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(name, "Recipient");

        // Then
        assertTrue(result.contains("&quot;"),
                "Should escape double quotes");
    }

    @Test
    void shouldHandleSingleQuoteEscaping() {
        // Given
        String name = "O'Brien";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(name, "Recipient");

        // Then
        assertTrue(result.contains("&#x27;"),
                "Should escape single quotes");
    }

    @Test
    void shouldHandleEmptyStrings() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("", "");

        // Then
        assertNotNull(result);
        assertTrue(result.contains("Kedves !"),
                "Should handle empty recipient name");
    }

    @Test
    void shouldHandleNamesWithSpecialCharacters() {
        // Given - names with accented characters (common in Hungarian)
        String recipientName = "Kovács Béla";
        String giftRecipient = "Szabó Péter";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(recipientName, giftRecipient);

        // Then
        assertTrue(result.contains(recipientName),
                "Should preserve accented characters");
        assertTrue(result.contains(giftRecipient),
                "Should preserve accented characters");
    }

    @Test
    void shouldContainChristmasElements() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertTrue(result.contains("Secret Santa"),
                "Should contain Secret Santa branding");
        assertTrue(result.contains("Mikulás ajándékozás"),
                "Should contain Hungarian subtitle");
        assertTrue(result.contains("Boldog ünnepeket!"),
                "Should contain holiday greeting");
    }

    @Test
    void shouldContainProperHtmlStructure() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertTrue(result.contains("<!DOCTYPE html>"));
        assertTrue(result.contains("<html"));
        assertTrue(result.contains("</html>"));
        assertTrue(result.contains("<head>"));
        assertTrue(result.contains("</head>"));
        assertTrue(result.contains("<body"));
        assertTrue(result.contains("</body>"));
        assertTrue(result.contains("charset=\"UTF-8\""),
                "Should declare UTF-8 charset");
    }

    @Test
    void shouldContainResponsiveMetaTags() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertTrue(result.contains("viewport"),
                "Should contain viewport meta tag for responsive design");
    }

    @Test
    void shouldUseTableLayoutForEmailCompatibility() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertTrue(result.contains("<table"),
                "Should use table-based layout for email client compatibility");
        assertTrue(result.contains("role=\"presentation\""),
                "Should use role=presentation for accessibility");
    }

    @Test
    void shouldContainChristmasColors() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertTrue(result.contains("linear-gradient"),
                "Should contain gradient styling");
        assertTrue(result.contains("#DA2C38"),
                "Should contain Christmas red color in recipient card");
        assertTrue(result.contains("#87C38F"),
                "Should contain Christmas green color in recipient card");
        assertTrue(result.contains("#43291F"),
                "Should contain neutral brown color");
    }

    @Test
    void shouldContainYetiMascotImage() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertTrue(result.contains("yeti-santa.png"),
                "Should contain Yeti mascot image");
        assertTrue(result.contains("alt=\"Secret Santa Yeti\""),
                "Should have proper alt text for accessibility");
        assertTrue(result.contains("<img"),
                "Should use img tag for Yeti mascot");
    }

    @Test
    void shouldContainEmojiDecorations() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertTrue(result.contains("🎁"),
                "Should contain gift emoji");
        assertTrue(result.contains("🎄"),
                "Should contain Christmas tree emoji");
    }

    @Test
    void shouldHandleMultipleConsecutiveSpecialCharacters() {
        // Given
        String name = "<<<>>>&&\"\"''";

        // When
        String result = emailTemplateService.buildSecretSantaEmail(name, "Recipient");

        // Then
        assertTrue(result.contains("&lt;") && result.contains("&gt;") &&
                        result.contains("&amp;") && result.contains("&quot;") &&
                        result.contains("&#x27;"),
                "Should escape all special characters correctly");
    }

    @Test
    void shouldProduceConsistentOutput() {
        // Given
        String recipientName = "John";
        String giftRecipient = "Jane";

        // When
        String result1 = emailTemplateService.buildSecretSantaEmail(recipientName, giftRecipient);
        String result2 = emailTemplateService.buildSecretSantaEmail(recipientName, giftRecipient);

        // Then
        assertEquals(result1, result2,
                "Should produce consistent output for same inputs");
    }

    @Test
    void shouldHandleLongNames() {
        // Given
        String longName = "Jean-Baptiste Emmanuel Zorg".repeat(5); // Very long name

        // When
        String result = emailTemplateService.buildSecretSantaEmail(longName, "Jane");

        // Then
        assertTrue(result.contains(longName),
                "Should handle long names without truncation");
    }

    @Test
    void shouldNotContainUnreplacedPlaceholders() {
        // When
        String result = emailTemplateService.buildSecretSantaEmail("John", "Jane");

        // Then
        assertFalse(result.contains("{{"),
                "Should not contain any unreplaced placeholders");
        assertFalse(result.contains("}}"),
                "Should not contain any unreplaced placeholders");
    }
}
