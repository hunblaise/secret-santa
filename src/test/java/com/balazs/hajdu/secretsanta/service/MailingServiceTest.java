package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.response.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class MailingServiceTest {

    private static final String MAIL_SUBJECT = "Wellhello Télapó";

    @Mock
    private JavaMailSender javaMailSender;

    private MailingService victim;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        victim = new MailingService(javaMailSender);
    }

    @Test
    void shouldSendMails() {
        // given
        Flux<Pair> pairs = Flux.fromIterable(List.of(new Pair("from-1", "to-1"), new Pair("from-2", "to-2")));
        Map<String, String> mappings = Map.of("from-1", "mapping-1",
                "to-1", "mapping-2",
                "from-2", "mapping-3",
                "to-2", "mapping-4");

        // when
        victim.sendMails(pairs, mappings);

        // then
        // first mail
        SimpleMailMessage firstMailMessage = new SimpleMailMessage();
        firstMailMessage.setText("Kedves mapping-1!\nAz ajándékot az alábbi személynek kell készítened: mapping-2");
        firstMailMessage.setSubject(MAIL_SUBJECT);
        firstMailMessage.setTo("from-1");
        verify(javaMailSender, times(1)).send(firstMailMessage);

        // second mail
        SimpleMailMessage secondMailMessage = new SimpleMailMessage();
        secondMailMessage.setText("Kedves mapping-3!\nAz ajándékot az alábbi személynek kell készítened: mapping-4");
        secondMailMessage.setSubject(MAIL_SUBJECT);
        secondMailMessage.setTo("from-2");
        verify(javaMailSender, times(1)).send(secondMailMessage);
    }

    @Test
    void shouldNotFailOnAnUnsuccessfulMail() {
        // given
        Flux<Pair> pairs = Flux.fromIterable(List.of(new Pair("from-1", "to-1"), new Pair("from-2", "to-2")));
        Map<String, String> mappings = Map.of("from-1", "mapping-1",
                "to-1", "mapping-2",
                "from-2", "mapping-3",
                "to-2", "mapping-4");

        // and
        SimpleMailMessage firstMailMessage = new SimpleMailMessage();
        firstMailMessage.setText("Kedves mapping-1!\nAz ajándékot az alábbi személynek kell készítened: mapping-2");
        firstMailMessage.setSubject(MAIL_SUBJECT);
        firstMailMessage.setTo("from-1");
        willThrow(new NullPointerException()).given(javaMailSender).send(firstMailMessage);

        // when
        victim.sendMails(pairs, mappings);

        // then
        // first mail
        verify(javaMailSender, times(1)).send(firstMailMessage);

        // second mail
        SimpleMailMessage secondMailMessage = new SimpleMailMessage();
        secondMailMessage.setText("Kedves mapping-3!\nAz ajándékot az alábbi személynek kell készítened: mapping-4");
        secondMailMessage.setSubject(MAIL_SUBJECT);
        secondMailMessage.setTo("from-2");
        verify(javaMailSender, times(1)).send(secondMailMessage);
    }
}