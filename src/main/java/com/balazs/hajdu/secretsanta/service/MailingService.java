package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.response.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * @author Balazs_Hajdu
 */
@Service
public class MailingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MailingService.class);

    private static final String MAIL_SUBJECT = "Wellhello Télapó";
    private static final String MAIL_TEXT = "Kedves %s!\nAz ajándékot az alábbi személynek kell készítened: %s";

    private final JavaMailSender javaMailSender;

    @Autowired
    public MailingService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendMails(Pair pair, Map<String, String> mailNameMappings) {
        Mono.just(createSimpleMailMessage(pair, mailNameMappings))
                .doOnNext(javaMailSender::send)
                .onErrorContinue(this::handleException)
                .subscribe();
    }

    private void handleException(Throwable throwable, Object o) {
        LOGGER.error("Error happened during the mail sending: message={}, error={}", o, throwable.getMessage());
    }

    private SimpleMailMessage createSimpleMailMessage(Pair pair, Map<String, String> mailNameMappings) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(pair.getFrom());
        message.setSubject(MAIL_SUBJECT);

        String fromName = (mailNameMappings != null) ? mailNameMappings.get(pair.getFrom()) : pair.getFrom();
        String toName = (mailNameMappings != null) ? mailNameMappings.get(pair.getTo()) : pair.getTo();
        
        message.setText(String.format(MAIL_TEXT, fromName, toName));
        LOGGER.debug(message.getText());
        return message;
    }
}
