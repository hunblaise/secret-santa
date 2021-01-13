package com.balazs.hajdu.secretsanta.controller;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.service.DummyHamiltonianTourService;
import com.balazs.hajdu.secretsanta.service.GraphMappingService;
import com.balazs.hajdu.secretsanta.service.MailingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Balazs_Hajdu
 */
@RestController
public class SecretSantaController {

    private static final String GENERATE_PAIRS = "/generatePairs";

    private final GraphMappingService graphMappingService;
    private final DummyHamiltonianTourService tourService;
    private final MailingService mailingService;

    @Autowired
    public SecretSantaController(GraphMappingService graphMappingService, DummyHamiltonianTourService tourService, MailingService mailingService) {
        this.graphMappingService = graphMappingService;
        this.tourService = tourService;
        this.mailingService = mailingService;
    }

    @PostMapping(GENERATE_PAIRS)
    public Flux<Pair> generateSecretSantaPairs(@RequestBody SecretSantaRequest request) {
        Mono<Graph> graph = graphMappingService.generateGraph(request);
        return tourService.generateSecretSantaPairs(graph)
                .doOnNext(pair -> sendEmail(request, pair));
    }

    private void sendEmail(SecretSantaRequest request, Pair pair) {
        if (request.isEmailSendingEnabled()) {
            mailingService.sendMails(pair, request.getMappings());
        }
    }
}
