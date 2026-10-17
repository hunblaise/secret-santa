package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Function;

import static java.util.stream.Collectors.toList;

/**
 * @author Balazs_Hajdu
 */
@Service
public class GraphMappingService {

    public Mono<Graph> generateGraph(SecretSantaRequest request) {
        return Mono.defer(() -> {
            validate(request);
            return Flux.fromIterable(request.getEmails())
                .map(Vertex::new)
                .collectMap(Function.identity(), vertex -> {
                    if (request.getCheats() != null && request.getCheats().containsKey(vertex.getLabel())) {
                        return List.of(new Vertex(request.getCheats().get(vertex.getLabel())));
                    }
                    return createVertices(request, vertex);
                }).map(Graph::new);
        });
    }

    private void validate(SecretSantaRequest request) {
        if (request == null || request.getEmails() == null || request.getEmails().size() < 2
                || request.getEmails().size() > 100) {
            throw new IllegalArgumentException("Provide between 2 and 100 participants");
        }
        Set<String> participants = new HashSet<>();
        for (String email : request.getEmails()) {
            if (email == null || email.isBlank() || !email.equals(email.trim()) || !participants.add(email)) {
                throw new IllegalArgumentException("Participants must be nonblank, unique, and have no surrounding whitespace");
            }
            if (request.isEmailSendingEnabled() && !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) {
                throw new IllegalArgumentException("Email delivery requires valid participant email addresses");
            }
        }
        if (request.getExclusions() != null) {
            request.getExclusions().forEach((giver, targets) -> {
                if (!participants.contains(giver) || targets == null || !participants.containsAll(targets)) {
                    throw new IllegalArgumentException("Exclusions must reference known participants");
                }
            });
        }
        Set<String> forcedRecipients = new HashSet<>();
        if (request.getCheats() != null) {
            request.getCheats().forEach((giver, receiver) -> {
                if (!participants.contains(giver) || !participants.contains(receiver) || giver.equals(receiver)
                        || !forcedRecipients.add(receiver)
                        || getExclusionsOrDefault(new Vertex(giver), request.getExclusions()).contains(receiver)) {
                    throw new IllegalArgumentException("Forced pairs must be unique, non-self participants and respect exclusions");
                }
            });
        }
        if (request.getMappings() != null) {
            request.getMappings().forEach((email, name) -> {
                if (!participants.contains(email) || name == null || name.isBlank()) {
                    throw new IllegalArgumentException("Display names must be nonblank and reference known participants");
                }
            });
        }
    }

    private List<Vertex> createVertices(SecretSantaRequest request, Vertex vertex) {
        return request.getEmails().stream()
                .map(Vertex::new)
                .filter(v -> vertexShouldBeKept(v, vertex, request.getExclusions()))
                .collect(toList());
    }

    private boolean vertexShouldBeKept(Vertex actual, Vertex parent, Map<String, List<String>> exclusions) {
        return !actual.equals(parent)
                && vertexIsNotPartOfExclusions(actual, parent, exclusions);
    }

    private boolean vertexIsNotPartOfExclusions(Vertex actual, Vertex parent, Map<String, List<String>> exclusions) {
        return getExclusionsOrDefault(parent, exclusions).stream().noneMatch(email -> actual.getLabel().equals(email));
    }

    private List<String> getExclusionsOrDefault(Vertex parent, Map<String, List<String>> exclusions) {
        return (exclusions != null) ? exclusions.getOrDefault(parent.getLabel(), List.of()) : List.of();
    }

}
