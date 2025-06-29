package com.balazs.hajdu.secretsanta.service.hamiltonian;

import com.balazs.hajdu.secretsanta.domain.Vertex;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TourState {
    private final List<Vertex> path;
    private final Set<Vertex> visited;
    private final Vertex startVertex;
    
    public TourState(Vertex startVertex) {
        this.startVertex = startVertex;
        this.path = new ArrayList<>();
        this.visited = new HashSet<>();
        this.path.add(startVertex);
        this.visited.add(startVertex);
    }

    public TourState(TourState other) {
        this.startVertex = other.startVertex;
        this.path = new ArrayList<>(other.path);
        this.visited = new HashSet<>(other.visited);
    }

    public void addVertex(Vertex vertex) {
        path.add(vertex);
        visited.add(vertex);
    }

    public void removeLastVertex() {
        if (path.size() > 1) { // Don't remove start vertex
            Vertex lastVertex = path.remove(path.size() - 1);
            visited.remove(lastVertex);
        }
    }

    public Vertex getCurrentVertex() {
        return path.isEmpty() ? null : path.get(path.size() - 1);
    }

    public boolean isVisited(Vertex vertex) {
        return visited.contains(vertex);
    }

    public boolean isComplete(int totalVertices) {
        return path.size() == totalVertices;
    }

    public boolean canCompleteCycle(Set<Vertex> possibleTargets) {
        return possibleTargets.contains(startVertex);
    }

    public List<Vertex> getPath() {
        return new ArrayList<>(path);
    }

    public Set<Vertex> getVisited() {
        return new HashSet<>(visited);
    }

    public Vertex getStartVertex() {
        return startVertex;
    }

    public int getPathSize() {
        return path.size();
    }
    
    @Override
    public String toString() {
        return "TourState{" +
                "path=" + path +
                ", visited=" + visited +
                ", startVertex=" + startVertex +
                '}';
    }
}