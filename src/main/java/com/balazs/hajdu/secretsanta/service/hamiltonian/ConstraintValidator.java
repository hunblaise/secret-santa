package com.balazs.hajdu.secretsanta.service.hamiltonian;

import com.balazs.hajdu.secretsanta.domain.Vertex;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Validates constraints for Secret Santa assignments.
 * Handles exclusions, cheats, and other business rules.
 */
public class ConstraintValidator {
    
    private final Map<String, List<String>> exclusions;
    private final Map<String, String> cheats;
    
    public ConstraintValidator(Map<String, List<String>> exclusions, Map<String, String> cheats) {
        this.exclusions = exclusions != null ? exclusions : Map.of();
        this.cheats = cheats != null ? cheats : Map.of();
    }
    
    /**
     * Check if a move from one vertex to another is valid according to constraints
     */
    public boolean isValidMove(Vertex from, Vertex to) {
        String fromLabel = from.getLabel();
        String toLabel = to.getLabel();
        
        // Check exclusions - if 'from' has exclusions that include 'to', it's invalid
        List<String> fromExclusions = exclusions.get(fromLabel);
        if (fromExclusions != null && fromExclusions.contains(toLabel)) {
            return false;
        }
        
        // Check cheats - if 'from' has a cheat (predetermined target), it must match
        String cheatTarget = cheats.get(fromLabel);
        if (cheatTarget != null && !cheatTarget.equals(toLabel)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get the predetermined target for a vertex (cheat), if any
     */
    public String getCheatTarget(Vertex vertex) {
        return cheats.get(vertex.getLabel());
    }
    
    /**
     * Check if a vertex has a predetermined target (cheat)
     */
    public boolean hasCheat(Vertex vertex) {
        return cheats.containsKey(vertex.getLabel());
    }
    
    /**
     * Filter a set of possible targets based on constraints
     */
    public Set<Vertex> filterValidTargets(Vertex from, Set<Vertex> possibleTargets) {
        return possibleTargets.stream()
                .filter(target -> isValidMove(from, target))
                .collect(java.util.stream.Collectors.toSet());
    }
    
    /**
     * Check if a complete path satisfies all constraints
     */
    public boolean validateCompletePath(List<Vertex> path) {
        for (int i = 0; i < path.size(); i++) {
            Vertex from = path.get(i);
            Vertex to = path.get((i + 1) % path.size()); // Wrap around for cycle
            
            if (!isValidMove(from, to)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Get exclusions for a specific vertex
     */
    public List<String> getExclusions(String vertexLabel) {
        return exclusions.getOrDefault(vertexLabel, List.of());
    }
    
    /**
     * Check early termination conditions - if impossible to satisfy remaining cheats
     */
    public boolean canSatisfyRemainingCheats(Set<Vertex> remainingVertices) {
        for (Vertex vertex : remainingVertices) {
            String cheatTarget = getCheatTarget(vertex);
            if (cheatTarget != null) {
                // Check if the cheat target is still available
                boolean targetAvailable = remainingVertices.stream()
                        .anyMatch(v -> v.getLabel().equals(cheatTarget));
                if (!targetAvailable) {
                    return false;
                }
            }
        }
        return true;
    }
}