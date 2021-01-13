package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasItem;

class DummyHamiltonianTourServiceTest {
    
    private DummyHamiltonianTourService victim;

    @BeforeEach
    void setUp() {
        victim = new DummyHamiltonianTourService();
    }

    @Test
    void shouldCreatePairsFromGraph() {
        // given
        Graph graph = new Graph(Map.of(new Vertex("label-1"), List.of(new Vertex("label-2")),
                new Vertex("label-2"), List.of(new Vertex("label-1"))));

        // when
        Flux<Pair> pairs = victim.generateSecretSantaPairs(graph);

        // then
        List<Pair> actual = pairs.collectList().block();
        assertThat(actual, hasItem(new Pair("label-1", "label-2")));
        assertThat(actual, hasItem(new Pair("label-2", "label-1")));
    }
}