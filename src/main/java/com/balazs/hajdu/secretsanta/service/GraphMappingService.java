package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static java.util.stream.Collectors.toList;

/**
 * @author Balazs_Hajdu
 */
@Service
public class GraphMappingService {

    public Mono<Graph> generateGraph(SecretSantaRequest request) {
        return Flux.fromIterable(request.getEmails())
                .map(Vertex::new)
                .collectMap(Function.identity(), vertex -> {
                    if (request.getCheats() != null && request.getCheats().containsKey(vertex.getLabel())) {
                        return List.of(new Vertex(request.getCheats().get(vertex.getLabel())));
                    }
                    return createVertices(request, vertex);
                }).map(Graph::new);
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
