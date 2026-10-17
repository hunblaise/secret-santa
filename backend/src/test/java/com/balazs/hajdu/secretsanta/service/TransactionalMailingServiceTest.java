package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.response.EmailResult;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.core.net.RequestOptions;
import com.resend.services.emails.Emails;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TransactionalMailingServiceTest {
    Emails emails;
    TransactionalMailingService service;

    @BeforeEach
    void setUp() {
        Resend client = mock(Resend.class);
        emails = mock(Emails.class);
        when(client.emails()).thenReturn(emails);
        service = new TransactionalMailingService(client, new EmailTemplateService());
        ReflectionTestUtils.setField(service, "retryAttempts", 2);
        ReflectionTestUtils.setField(service, "retryDelayMs", 10L);
        ReflectionTestUtils.setField(service, "fromAddress", "santa@example.com");
    }

    @Test
    void retriesTransientFailureWithSameIdempotencyKeyOffEventLoop() throws Exception {
        AtomicReference<String> thread = new AtomicReference<>();
        when(emails.send(any(CreateEmailOptions.class), any(RequestOptions.class)))
                .thenThrow(new ResendException(503, "unavailable"))
                .thenAnswer(invocation -> {
                    thread.set(Thread.currentThread().getName());
                    return new CreateEmailResponse("email-id");
                });
        Map<String, EmailResult> result = Mono.defer(() -> service.sendAllEmails(
                        List.of(new Pair("a@example.com", "b@example.com")), Map.of()))
                .subscribeOn(Schedulers.parallel()).block();
        assertEquals(EmailResult.DELIVERED, result.get("a@example.com"));
        assertTrue(thread.get().startsWith("boundedElastic"));
        ArgumentCaptor<RequestOptions> options = ArgumentCaptor.forClass(RequestOptions.class);
        verify(emails, times(2)).send(any(CreateEmailOptions.class), options.capture());
        assertNotNull(options.getAllValues().getFirst().getIdempotencyKey());
        assertEquals(options.getAllValues().getFirst().getIdempotencyKey(),
                options.getAllValues().getLast().getIdempotencyKey());
    }

    @Test
    void permanentFailureDoesNotRetryAndOtherParticipantsStillReceiveEmails() throws Exception {
        when(emails.send(any(CreateEmailOptions.class), any(RequestOptions.class)))
                .thenThrow(new ResendException(422, "invalid address"))
                .thenReturn(new CreateEmailResponse("email-id"));
        Map<String, EmailResult> result = service.sendAllEmails(List.of(
                new Pair("a@example.com", "b@example.com"),
                new Pair("b@example.com", "a@example.com")), null).block();
        assertEquals(Map.of("a@example.com", EmailResult.FAILED, "b@example.com", EmailResult.DELIVERED), result);
        verify(emails, times(2)).send(any(CreateEmailOptions.class), any(RequestOptions.class));
    }

    @Test
    void acceptsNullPairsAsEmpty() {
        assertTrue(service.sendAllEmails(null, null).block().isEmpty());
        verifyNoInteractions(emails);
    }
}
