package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.service.hamiltonian.ConstraintValidator;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.security.SecureRandom;
import java.util.*;

/** Generates a complete, randomized single cycle or fails without emitting partial pairs. */
@Service
public class HamiltonianTourService {
    private static final int MAX_SEARCH_STEPS = 200_000;
    private final SecureRandom random = new SecureRandom();

    public Flux<Pair> generateSecretSantaPairs(Graph graph) {
        return generateSecretSantaPairs(graph, Map.of(), Map.of());
    }

    public Flux<Pair> generateSecretSantaPairs(Graph graph, Map<String, List<String>> exclusions,
                                              Map<String, String> cheats) {
        return Mono.fromCallable(() -> findCycle(graph, new ConstraintValidator(exclusions, cheats)))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(Flux::fromIterable);
    }

    private List<Pair> findCycle(Graph graph, ConstraintValidator validator) {
        if (graph.getVertices().isEmpty()) {
            return List.of();
        }
        Map<Vertex, List<Vertex>> edges = new LinkedHashMap<>();
        graph.getVertices().forEach((giver, targets) -> {
            List<Vertex> allowed = new ArrayList<>(targets.stream()
                    .filter(target -> !giver.equals(target))
                    .filter(graph.getVertices()::containsKey)
                    .filter(target -> validator.isValidMove(giver, target)).toList());
            Collections.shuffle(allowed, random);
            edges.put(giver, allowed);
        });
        if (edges.values().stream().anyMatch(List::isEmpty)) {
            throw new IllegalArgumentException("No complete Secret Santa cycle satisfies these constraints");
        }
        List<Vertex> starts = new ArrayList<>(edges.keySet());
        Collections.shuffle(starts, random);
        List<Vertex> path = new ArrayList<>(List.of(starts.getFirst()));
        Set<Vertex> visited = new HashSet<>(path);
        if (!search(edges, path, visited, new int[]{MAX_SEARCH_STEPS})) {
            throw new IllegalArgumentException("No complete Secret Santa cycle satisfies these constraints");
        }
        List<Pair> pairs = new ArrayList<>();
        for (int i = 0; i < path.size(); i++) {
            pairs.add(new Pair(path.get(i).getLabel(), path.get((i + 1) % path.size()).getLabel()));
        }
        return pairs;
    }

    private boolean search(Map<Vertex, List<Vertex>> edges, List<Vertex> path,
                           Set<Vertex> visited, int[] budget) {
        if (--budget[0] < 0) {
            throw new IllegalArgumentException("Assignment search limit reached; simplify the constraints and retry");
        }
        Vertex current = path.getLast();
        if (path.size() == edges.size()) {
            return edges.get(current).contains(path.getFirst());
        }
        for (Vertex next : edges.get(current)) {
            if (visited.add(next)) {
                path.add(next);
                if (search(edges, path, visited, budget)) {
                    return true;
                }
                path.removeLast();
                visited.remove(next);
            }
        }
        return false;
    }
}
