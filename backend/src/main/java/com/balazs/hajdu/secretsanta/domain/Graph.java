package com.balazs.hajdu.secretsanta.domain;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * @author Balazs_Hajdu
 */
public class Graph {
    private Map<Vertex, List<Vertex>> vertices;

    public Graph(Map<Vertex, List<Vertex>> vertices) {
        this.vertices = vertices;
    }

    public Map<Vertex, List<Vertex>> getVertices() {
        return vertices;
    }

    @Override
    public int hashCode() {
        return Objects.hash(vertices);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        final Graph other = (Graph) obj;
        return Objects.equals(this.vertices, other.vertices);
    }

    @Override
    public String toString() {
        return "Graph{"
            + "vertices=" + vertices
            + '}';
    }

    public void removeEdgesForTheGivenVertex(String label) {
        vertices.values().forEach(vertices -> vertices.remove(new Vertex(label)));
    }
}
