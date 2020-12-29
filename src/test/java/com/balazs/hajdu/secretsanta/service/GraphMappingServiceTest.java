package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.request.SecretSantaRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

class GraphMappingServiceTest {

    private GraphMappingService victim;

    @BeforeEach
    void setUp() {
        victim = new GraphMappingService();
    }

    @Test
    void shouldCreateGraphFromRequest() {
        // given
        SecretSantaRequest request = new SecretSantaRequest();
        request.setEmails(List.of("email-1", "email-2", "email-3", "email-4"));
        request.setExclusions(Map.of("email-1", List.of(),
                "email-2", List.of("email-1"),
                "email-3", List.of("email-2"),
                "email-4", List.of()));

        // and
        Vertex vertex1 = new Vertex("email-1");
        Vertex vertex2 = new Vertex("email-2");
        Vertex vertex3 = new Vertex("email-3");
        Vertex vertex4 = new Vertex("email-4");
        Map<Vertex, List<Vertex>> expected = Map.of(vertex1, List.of(vertex2, vertex3, vertex4),
                vertex2, List.of(vertex3, vertex4),
                vertex3, List.of(vertex1, vertex4),
                vertex4, List.of(vertex1, vertex2, vertex3));

        // when
        Mono<Graph> graph = victim.generateGraph(request);

        // then
        Graph actual = graph.block();
        assertThat(actual, is(new Graph(expected)));
    }
}