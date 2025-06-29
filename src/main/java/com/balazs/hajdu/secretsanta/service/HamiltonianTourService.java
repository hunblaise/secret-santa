package com.balazs.hajdu.secretsanta.service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import com.balazs.hajdu.secretsanta.service.hamiltonian.ConstraintValidator;
import com.balazs.hajdu.secretsanta.service.hamiltonian.TourState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of a real Hamiltonian tour algorithm for Secret Santa assignments.
 * Uses backtracking with constraint propagation to find valid circular assignments
 * where each person gives exactly one gift and receives exactly one gift.
 */
@Service
public class HamiltonianTourService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HamiltonianTourService.class);
    
    public Flux<Pair> generateSecretSantaPairs(Graph graph) {
        return Mono.fromCallable(() -> findHamiltonianCycle(graph))
                .flatMapMany(pairs -> {
                    if (pairs.isEmpty()) {
                        LOGGER.warn("No valid Hamiltonian cycle found, attempting fallback strategy");
                        return Flux.fromIterable(findBestEffortAssignment(graph));
                    }
                    return Flux.fromIterable(pairs);
                })
                .onErrorResume(e -> {
                    LOGGER.error("Error during Hamiltonian tour generation: {}", e.getMessage());
                    return Flux.empty();
                });
    }
    
    /**
     * Find a complete Hamiltonian cycle using backtracking algorithm
     */
    private List<Pair> findHamiltonianCycle(Graph graph) {
        Map<Vertex, List<Vertex>> adjacencyList = graph.getVertices();
        
        if (adjacencyList.isEmpty()) {
            return List.of();
        }
        
        // Extract constraints from the graph structure
        ConstraintValidator validator = createConstraintValidator(graph);
        
        // Try starting from each vertex to find a valid cycle
        for (Vertex startVertex : adjacencyList.keySet()) {
            List<Vertex> cycle = findCycleFromVertex(startVertex, adjacencyList, validator);
            if (cycle != null) {
                LOGGER.info("Found valid Hamiltonian cycle starting from vertex: {}", startVertex.getLabel());
                return convertCycleToSecretSantaPairs(cycle);
            }
        }
        
        LOGGER.warn("No valid Hamiltonian cycle found in graph");
        return List.of();
    }
    
    /**
     * Find a Hamiltonian cycle starting from a specific vertex
     */
    private List<Vertex> findCycleFromVertex(Vertex startVertex, Map<Vertex, List<Vertex>> adjacencyList, 
                                           ConstraintValidator validator) {
        TourState state = new TourState(startVertex);
        Set<Vertex> allVertices = adjacencyList.keySet();
        
        if (backtrackSearch(state, adjacencyList, validator, allVertices)) {
            return state.getPath();
        }
        
        return null;
    }
    
    /**
     * Recursive backtracking search for Hamiltonian cycle
     */
    private boolean backtrackSearch(TourState state, Map<Vertex, List<Vertex>> adjacencyList,
                                  ConstraintValidator validator, Set<Vertex> allVertices) {
        
        // Base case: if we've visited all vertices, check if we can return to start
        if (state.isComplete(allVertices.size())) {
            Vertex currentVertex = state.getCurrentVertex();
            List<Vertex> possibleTargets = adjacencyList.get(currentVertex);
            
            if (possibleTargets != null && validator.isValidMove(currentVertex, state.getStartVertex()) &&
                possibleTargets.contains(state.getStartVertex())) {
                return true; // Found complete cycle
            }
            return false;
        }
        
        // Get current vertex and its possible targets
        Vertex currentVertex = state.getCurrentVertex();
        List<Vertex> possibleTargets = adjacencyList.get(currentVertex);
        
        if (possibleTargets == null) {
            return false;
        }
        
        // Try each unvisited target
        for (Vertex nextVertex : possibleTargets) {
            if (!state.isVisited(nextVertex) && validator.isValidMove(currentVertex, nextVertex)) {
                
                // Early constraint checking - can we still satisfy remaining cheats?
                Set<Vertex> remainingVertices = getRemainingVertices(allVertices, state.getVisited());
                remainingVertices.remove(nextVertex);
                
                if (!validator.canSatisfyRemainingCheats(remainingVertices)) {
                    continue; // Skip this path, it leads to unsatisfiable constraints
                }
                
                // Make the move
                state.addVertex(nextVertex);
                
                // Recursive call
                if (backtrackSearch(state, adjacencyList, validator, allVertices)) {
                    return true;
                }
                
                // Backtrack
                state.removeLastVertex();
            }
        }
        
        return false;
    }
    
    /**
     * Fallback strategy when no perfect Hamiltonian cycle exists
     */
    private List<Pair> findBestEffortAssignment(Graph graph) {
        Map<Vertex, List<Vertex>> adjacencyList = graph.getVertices();
        List<Pair> assignments = new ArrayList<>();
        Set<Vertex> usedRecipients = new HashSet<>();
        
        // Try to assign as many people as possible
        for (Map.Entry<Vertex, List<Vertex>> entry : adjacencyList.entrySet()) {
            Vertex giver = entry.getKey();
            List<Vertex> possibleRecipients = entry.getValue();
            
            // Find first available recipient
            for (Vertex recipient : possibleRecipients) {
                if (!usedRecipients.contains(recipient)) {
                    assignments.add(new Pair(giver.getLabel(), recipient.getLabel()));
                    usedRecipients.add(recipient);
                    break;
                }
            }
        }
        
        LOGGER.info("Fallback assignment created {} pairs out of {} possible", 
                   assignments.size(), adjacencyList.size());
        return assignments;
    }
    
    /**
     * Convert a cycle of vertices to Secret Santa pairs
     */
    private List<Pair> convertCycleToSecretSantaPairs(List<Vertex> cycle) {
        List<Pair> pairs = new ArrayList<>();
        
        for (int i = 0; i < cycle.size(); i++) {
            Vertex giver = cycle.get(i);
            Vertex receiver = cycle.get((i + 1) % cycle.size()); // Wrap around for cycle
            pairs.add(new Pair(giver.getLabel(), receiver.getLabel()));
        }
        
        return pairs;
    }
    
    /**
     * Create constraint validator from graph structure.
     * Note: In the current implementation, constraints are handled by the graph construction
     * in GraphMappingService. This method prepares for future enhancements where constraints
     * could be passed directly to this service.
     */
    private ConstraintValidator createConstraintValidator(Graph graph) {
        // For now, create with empty constraints since they're already applied to the graph
        // In future versions, we could extract constraints from the original request
        return new ConstraintValidator(Map.of(), Map.of());
    }
    
    /**
     * Enhanced version that accepts constraints directly (for future use)
     */
    public Flux<Pair> generateSecretSantaPairs(Graph graph, Map<String, List<String>> exclusions, 
                                             Map<String, String> cheats) {
        return Mono.fromCallable(() -> findHamiltonianCycleWithConstraints(graph, exclusions, cheats))
                .flatMapMany(pairs -> {
                    if (pairs.isEmpty()) {
                        LOGGER.warn("No valid Hamiltonian cycle found with constraints, attempting fallback strategy");
                        return Flux.fromIterable(findBestEffortAssignment(graph));
                    }
                    return Flux.fromIterable(pairs);
                })
                .onErrorResume(e -> {
                    LOGGER.error("Error during Hamiltonian tour generation with constraints: {}", e.getMessage());
                    return Flux.empty();
                });
    }
    
    /**
     * Find Hamiltonian cycle with explicit constraints
     */
    private List<Pair> findHamiltonianCycleWithConstraints(Graph graph, Map<String, List<String>> exclusions, 
                                                         Map<String, String> cheats) {
        Map<Vertex, List<Vertex>> adjacencyList = graph.getVertices();
        
        if (adjacencyList.isEmpty()) {
            return List.of();
        }
        
        ConstraintValidator validator = new ConstraintValidator(exclusions, cheats);
        
        // Try starting from each vertex to find a valid cycle
        for (Vertex startVertex : adjacencyList.keySet()) {
            List<Vertex> cycle = findCycleFromVertex(startVertex, adjacencyList, validator);
            if (cycle != null) {
                LOGGER.info("Found valid Hamiltonian cycle with constraints starting from vertex: {}", 
                           startVertex.getLabel());
                return convertCycleToSecretSantaPairs(cycle);
            }
        }
        
        LOGGER.warn("No valid Hamiltonian cycle found with constraints");
        return List.of();
    }
    
    /**
     * Get vertices that haven't been visited yet
     */
    private Set<Vertex> getRemainingVertices(Set<Vertex> allVertices, Set<Vertex> visitedVertices) {
        return allVertices.stream()
                .filter(v -> !visitedVertices.contains(v))
                .collect(Collectors.toSet());
    }
}