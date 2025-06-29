package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.response.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Map;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MailingServiceTest {

    private static final String MAIL_SUBJECT = "Wellhello Télapó";

    @Mock
    private JavaMailSender javaMailSender;

    private MailingService victim;

    @BeforeEach
    void setUp() {
        victim = new MailingService(javaMailSender);
    }

    @Test
    void shouldSendMails() {
        // given
        Pair pair = new Pair("from-1", "to-1");
        Map<String, String> mappings = Map.of("from-1", "mapping-1",
                "to-1", "mapping-2",
                "from-2", "mapping-3",
                "to-2", "mapping-4");

        // when
        victim.sendMails(pair, mappings);

        // then
        // first mail
        SimpleMailMessage firstMailMessage = new SimpleMailMessage();
        firstMailMessage.setText("Kedves mapping-1!\nAz ajándékot az alábbi személynek kell készítened: mapping-2");
        firstMailMessage.setSubject(MAIL_SUBJECT);
        firstMailMessage.setTo("from-1");
        verify(javaMailSender, times(1)).send(firstMailMessage);
    }

    @Test
    void shouldSendMailsWithNullMappings() {
        // given
        Pair pair = new Pair("from@example.com", "to@example.com");

        // when
        victim.sendMails(pair, null);

        // then
        SimpleMailMessage expectedMessage = new SimpleMailMessage();
        expectedMessage.setText("Kedves from@example.com!\nAz ajándékot az alábbi személynek kell készítened: to@example.com");
        expectedMessage.setSubject(MAIL_SUBJECT);
        expectedMessage.setTo("from@example.com");
        verify(javaMailSender, times(1)).send(expectedMessage);
    }
}