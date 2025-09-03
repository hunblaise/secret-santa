package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

class HamiltonianTourServiceTest {
    
    private HamiltonianTourService service;

    @BeforeEach
    void setUp() {
        service = new HamiltonianTourService();
    }

    @Test
    void shouldCreateValidHamiltonianCycleFromSimpleGraph() {
        // given - simple 2-person cycle
        Graph graph = new Graph(Map.of(
            new Vertex("alice"), List.of(new Vertex("bob")),
            new Vertex("bob"), List.of(new Vertex("alice"))
        ));

        // when
        Flux<Pair> pairs = service.generateSecretSantaPairs(graph);

        // then
        List<Pair> actual = pairs.collectList().block();
        assertNotNull(actual);
        assertEquals(2, actual.size());
        
        // Verify it's a valid cycle
        assertThat(actual, hasItem(new Pair("alice", "bob")));
        assertThat(actual, hasItem(new Pair("bob", "alice")));
        
        // Verify everyone gives and receives exactly once
        assertTrue(isValidSecretSantaAssignment(actual, List.of("alice", "bob")));
    }
    
    @Test
    void shouldCreateValidHamiltonianCycleFromComplexGraph() {
        // given - complete graph of 4 people
        Vertex alice = new Vertex("alice");
        Vertex bob = new Vertex("bob");
        Vertex charlie = new Vertex("charlie");
        Vertex diana = new Vertex("diana");
        
        Graph graph = new Graph(Map.of(
            alice, List.of(bob, charlie, diana),
            bob, List.of(alice, charlie, diana),
            charlie, List.of(alice, bob, diana),
            diana, List.of(alice, bob, charlie)
        ));

        // when
        Flux<Pair> pairs = service.generateSecretSantaPairs(graph);

        // then
        List<Pair> actual = pairs.collectList().block();
        assertNotNull(actual);
        assertEquals(4, actual.size());
        
        // Verify everyone gives and receives exactly once
        assertTrue(isValidSecretSantaAssignment(actual, List.of("alice", "bob", "charlie", "diana")));
        
        // Verify it forms a cycle
        assertTrue(isValidCycle(actual));
    }
    
    @Test
    void shouldHandleGraphWithConstraints() {
        // given - graph where alice can't give to bob, but cycle is still possible
        Vertex alice = new Vertex("alice");
        Vertex bob = new Vertex("bob");
        Vertex charlie = new Vertex("charlie");
        
        Graph graph = new Graph(Map.of(
            alice, List.of(charlie), // Alice can only give to Charlie
            bob, List.of(alice),     // Bob can only give to Alice
            charlie, List.of(bob)    // Charlie can only give to Bob
        ));

        // when
        Flux<Pair> pairs = service.generateSecretSantaPairs(graph);

        // then
        List<Pair> actual = pairs.collectList().block();
        assertNotNull(actual);
        assertEquals(3, actual.size());
        
        // Verify specific constraints are respected
        assertThat(actual, hasItem(new Pair("alice", "charlie")));
        assertThat(actual, hasItem(new Pair("bob", "alice")));
        assertThat(actual, hasItem(new Pair("charlie", "bob")));
        
        assertTrue(isValidSecretSantaAssignment(actual, List.of("alice", "bob", "charlie")));
    }
    
    @Test
    void shouldHandleImpossibleGraphWithFallback() {
        // given - impossible graph where no Hamiltonian cycle exists
        Vertex alice = new Vertex("alice");
        Vertex bob = new Vertex("bob");
        Vertex charlie = new Vertex("charlie");
        
        Graph graph = new Graph(Map.of(
            alice, List.of(bob),     // Alice can only give to Bob
            bob, List.of(charlie),   // Bob can only give to Charlie  
            charlie, List.of()       // Charlie can't give to anyone
        ));

        // when
        Flux<Pair> pairs = service.generateSecretSantaPairs(graph);

        // then - should use fallback strategy
        List<Pair> actual = pairs.collectList().block();
        assertNotNull(actual);
        
        // Should have created some assignments, but not a perfect cycle
        assertTrue(actual.size() >= 2); // At least Alice->Bob and Bob->Charlie
        assertThat(actual, hasItem(new Pair("alice", "bob")));
        assertThat(actual, hasItem(new Pair("bob", "charlie")));
    }
    
    @Test
    void shouldHandleEmptyGraph() {
        // given
        Graph graph = new Graph(Map.of());

        // when
        Flux<Pair> pairs = service.generateSecretSantaPairs(graph);

        // then
        List<Pair> actual = pairs.collectList().block();
        assertNotNull(actual);
        assertTrue(actual.isEmpty());
    }
    
    @Test
    void shouldHandleSinglePersonGraph() {
        // given - single person (impossible scenario)
        Graph graph = new Graph(Map.of(
            new Vertex("alice"), List.of()
        ));

        // when
        Flux<Pair> pairs = service.generateSecretSantaPairs(graph);

        // then
        List<Pair> actual = pairs.collectList().block();
        assertNotNull(actual);
        assertTrue(actual.isEmpty()); // No valid assignment possible
    }
    
    /**
     * Verify that the assignment is valid for Secret Santa:
     * - Each person gives exactly one gift
     * - Each person receives exactly one gift
     */
    private boolean isValidSecretSantaAssignment(List<Pair> pairs, List<String> participants) {
        Set<String> givers = pairs.stream().map(Pair::getFrom).collect(Collectors.toSet());
        Set<String> receivers = pairs.stream().map(Pair::getTo).collect(Collectors.toSet());
        
        // Each participant should appear exactly once as giver and receiver
        return givers.size() == participants.size() && 
               receivers.size() == participants.size() &&
               givers.containsAll(participants) &&
               receivers.containsAll(participants);
    }
    
    /**
     * Verify that the pairs form a valid cycle
     */
    private boolean isValidCycle(List<Pair> pairs) {
        if (pairs.isEmpty()) return true;
        
        // Build adjacency map
        Map<String, String> giftMap = pairs.stream()
                .collect(Collectors.toMap(Pair::getFrom, Pair::getTo));
        
        // Follow the cycle - should visit all participants exactly once
        String current = pairs.get(0).getFrom();
        Set<String> visited = new HashSet<>();
        int steps = 0;
        
        do {
            if (visited.contains(current)) {
                return false; // Cycle detected before visiting all
            }
            visited.add(current);
            current = giftMap.get(current);
            steps++;
        } while (current != null && !current.equals(pairs.get(0).getFrom()) && steps <= pairs.size());
        
        return steps == pairs.size() && visited.size() == pairs.size();
    }
}