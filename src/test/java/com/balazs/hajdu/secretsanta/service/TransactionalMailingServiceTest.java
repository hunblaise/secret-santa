package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.EmailStatus;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionalMailingServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    private TransactionalMailingService service;

    @BeforeEach
    void setUp() {
        service = new TransactionalMailingService(javaMailSender);
        
        // Set test configuration values
        ReflectionTestUtils.setField(service, "retryAttempts", 2);
        ReflectionTestUtils.setField(service, "retryDelayMs", 100L);
        ReflectionTestUtils.setField(service, "batchEnabled", true);
    }

    @Test
    void shouldSendAllEmailsSuccessfully() {
        // given
        List<Pair> pairs = List.of(
            new Pair("alice@example.com", "bob@example.com"),
            new Pair("bob@example.com", "charlie@example.com")
        );
        Map<String, String> nameMapping = Map.of(
            "alice@example.com", "Alice",
            "bob@example.com", "Bob",
            "charlie@example.com", "Charlie"
        );

        // when
        Map<String, EmailResult> results = service.sendAllEmails(pairs, nameMapping).block();

        // then
        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(EmailResult.DELIVERED, results.get("alice@example.com"));
        assertEquals(EmailResult.DELIVERED, results.get("bob@example.com"));
        
        verify(javaMailSender).send(any(SimpleMailMessage[].class));
    }

    @Test
    void shouldHandleBatchEmailFailure() {
        // given
        List<Pair> pairs = List.of(
            new Pair("alice@example.com", "bob@example.com")
        );
        
        doThrow(new MailException("SMTP server unavailable") {})
                .when(javaMailSender).send(any(SimpleMailMessage[].class));

        // when
        Map<String, EmailResult> results = service.sendAllEmails(pairs, null).block();

        // then
        assertNotNull(results);
        assertEquals(EmailResult.FAILED, results.get("alice@example.com"));
        
        // Should retry configured number of times
        verify(javaMailSender, times(3)).send(any(SimpleMailMessage[].class)); // Initial + 2 retries
    }

    @Test
    void shouldDetermineEmailStatusCorrectly() {
        // Test SUCCESS
        Map<String, EmailResult> allDelivered = Map.of(
            "user1", EmailResult.DELIVERED,
            "user2", EmailResult.DELIVERED
        );
        assertEquals(EmailStatus.SUCCESS, service.determineEmailStatus(allDelivered));

        // Test FAILED
        Map<String, EmailResult> allFailed = Map.of(
            "user1", EmailResult.FAILED,
            "user2", EmailResult.FAILED
        );
        assertEquals(EmailStatus.FAILED, service.determineEmailStatus(allFailed));

        // Test PARTIAL
        Map<String, EmailResult> partial = Map.of(
            "user1", EmailResult.DELIVERED,
            "user2", EmailResult.FAILED
        );
        assertEquals(EmailStatus.PARTIAL, service.determineEmailStatus(partial));

        // Test PENDING
        Map<String, EmailResult> pending = Map.of(
            "user1", EmailResult.PENDING,
            "user2", EmailResult.DELIVERED
        );
        assertEquals(EmailStatus.PENDING, service.determineEmailStatus(pending));

        // Test DISABLED
        assertEquals(EmailStatus.DISABLED, service.determineEmailStatus(Map.of()));
    }

    @Test
    void shouldHandleNullNameMapping() {
        // given
        List<Pair> pairs = List.of(
            new Pair("alice@example.com", "bob@example.com")
        );

        // when
        Map<String, EmailResult> results = service.sendAllEmails(pairs, null).block();

        // then
        assertNotNull(results);
        assertEquals(EmailResult.DELIVERED, results.get("alice@example.com"));
        verify(javaMailSender).send(any(SimpleMailMessage[].class));
    }

    @Test
    void shouldHandleEmptyPairsList() {
        // given
        List<Pair> emptyPairs = List.of();

        // when
        Map<String, EmailResult> results = service.sendAllEmails(emptyPairs, null).block();

        // then
        assertNotNull(results);
        assertTrue(results.isEmpty());
        assertEquals(EmailStatus.DISABLED, service.determineEmailStatus(results));
        
        verifyNoInteractions(javaMailSender);
    }

    @Test
    void shouldSendEmailsIndividuallyWhenBatchDisabled() {
        // given
        ReflectionTestUtils.setField(service, "batchEnabled", false);
        
        List<Pair> pairs = List.of(
            new Pair("alice@example.com", "bob@example.com"),
            new Pair("bob@example.com", "charlie@example.com")
        );

        // when
        Map<String, EmailResult> results = service.sendAllEmails(pairs, null).block();

        // then
        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(EmailResult.DELIVERED, results.get("alice@example.com"));
        assertEquals(EmailResult.DELIVERED, results.get("bob@example.com"));
        
        // Should send individual emails, not batch
        verify(javaMailSender, times(2)).send(any(SimpleMailMessage.class));
        verify(javaMailSender, never()).send(any(SimpleMailMessage[].class));
    }

    @Test
    void shouldContinueWithOtherEmailsWhenIndividualEmailFails() {
        // given
        ReflectionTestUtils.setField(service, "batchEnabled", false);
        
        List<Pair> pairs = List.of(
            new Pair("alice@example.com", "bob@example.com"),
            new Pair("bob@example.com", "charlie@example.com")
        );
        
        // Set retry attempts to 1 to avoid excessive retries in test
        ReflectionTestUtils.setField(service, "retryAttempts", 1);
        
        // Mock to fail on specific email addresses
        doAnswer(invocation -> {
            SimpleMailMessage message = invocation.getArgument(0);
            if ("alice@example.com".equals(message.getTo()[0])) {
                throw new MailException("Invalid recipient") {};
            }
            return null; // Success for other emails
        }).when(javaMailSender).send(any(SimpleMailMessage.class));

        // when
        Map<String, EmailResult> results = service.sendAllEmails(pairs, null).block();

        // then
        assertNotNull(results);
        assertEquals(EmailResult.FAILED, results.get("alice@example.com"));
        assertEquals(EmailResult.DELIVERED, results.get("bob@example.com"));
        assertEquals(EmailStatus.PARTIAL, service.determineEmailStatus(results));
    }
}