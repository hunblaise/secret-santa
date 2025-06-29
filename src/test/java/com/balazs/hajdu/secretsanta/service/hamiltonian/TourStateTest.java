package com.balazs.hajdu.secretsanta.service.hamiltonian;

import com.balazs.hajdu.secretsanta.domain.Vertex;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TourStateTest {

    private TourState tourState;
    private Vertex startVertex;

    @BeforeEach
    void setUp() {
        startVertex = new Vertex("start");
        tourState = new TourState(startVertex);
    }

    @Test
    void shouldInitializeWithStartVertex() {
        // then
        assertEquals(startVertex, tourState.getCurrentVertex());
        assertEquals(startVertex, tourState.getStartVertex());
        assertEquals(1, tourState.getPathSize());
        assertTrue(tourState.isVisited(startVertex));
    }

    @Test
    void shouldAddVertex() {
        // given
        Vertex nextVertex = new Vertex("next");

        // when
        tourState.addVertex(nextVertex);

        // then
        assertEquals(nextVertex, tourState.getCurrentVertex());
        assertEquals(2, tourState.getPathSize());
        assertTrue(tourState.isVisited(nextVertex));
        assertTrue(tourState.isVisited(startVertex));
    }

    @Test
    void shouldRemoveLastVertex() {
        // given
        Vertex vertex1 = new Vertex("vertex1");
        Vertex vertex2 = new Vertex("vertex2");
        tourState.addVertex(vertex1);
        tourState.addVertex(vertex2);

        // when
        tourState.removeLastVertex();

        // then
        assertEquals(vertex1, tourState.getCurrentVertex());
        assertEquals(2, tourState.getPathSize());
        assertFalse(tourState.isVisited(vertex2));
        assertTrue(tourState.isVisited(vertex1));
    }

    @Test
    void shouldNotRemoveStartVertex() {
        // when - try to remove when only start vertex remains
        tourState.removeLastVertex();

        // then - start vertex should remain
        assertEquals(startVertex, tourState.getCurrentVertex());
        assertEquals(1, tourState.getPathSize());
        assertTrue(tourState.isVisited(startVertex));
    }

    @Test
    void shouldDetectComplete() {
        // given
        tourState.addVertex(new Vertex("vertex1"));
        tourState.addVertex(new Vertex("vertex2"));

        // when & then
        assertFalse(tourState.isComplete(4)); // Need 4 vertices total
        assertTrue(tourState.isComplete(3));  // Have 3 vertices
    }

    @Test
    void shouldDetectCanCompleteCycle() {
        // given
        Set<Vertex> possibleTargets = Set.of(
            new Vertex("other1"),
            startVertex,              // Can return to start
            new Vertex("other2")
        );

        // when & then
        assertTrue(tourState.canCompleteCycle(possibleTargets));
    }

    @Test
    void shouldDetectCannotCompleteCycle() {
        // given
        Set<Vertex> possibleTargets = Set.of(
            new Vertex("other1"),
            new Vertex("other2")      // Cannot return to start
        );

        // when & then
        assertFalse(tourState.canCompleteCycle(possibleTargets));
    }

    @Test
    void shouldCreateCopy() {
        // given
        tourState.addVertex(new Vertex("vertex1"));
        tourState.addVertex(new Vertex("vertex2"));

        // when
        TourState copy = new TourState(tourState);

        // then
        assertEquals(tourState.getPathSize(), copy.getPathSize());
        assertEquals(tourState.getCurrentVertex(), copy.getCurrentVertex());
        assertEquals(tourState.getStartVertex(), copy.getStartVertex());
        assertEquals(tourState.getVisited(), copy.getVisited());

        // Verify it's a deep copy - changes to original don't affect copy
        tourState.addVertex(new Vertex("vertex3"));
        assertNotEquals(tourState.getPathSize(), copy.getPathSize());
    }

    @Test
    void shouldReturnCorrectPath() {
        // given
        Vertex vertex1 = new Vertex("vertex1");
        Vertex vertex2 = new Vertex("vertex2");
        tourState.addVertex(vertex1);
        tourState.addVertex(vertex2);

        // when
        var path = tourState.getPath();

        // then
        assertEquals(3, path.size());
        assertEquals(startVertex, path.get(0));
        assertEquals(vertex1, path.get(1));
        assertEquals(vertex2, path.get(2));

        // Verify it's a copy - modifications don't affect original
        path.clear();
        assertEquals(3, tourState.getPathSize());
    }

    @Test
    void shouldReturnCorrectVisitedSet() {
        // given
        Vertex vertex1 = new Vertex("vertex1");
        tourState.addVertex(vertex1);

        // when
        Set<Vertex> visited = tourState.getVisited();

        // then
        assertEquals(2, visited.size());
        assertTrue(visited.contains(startVertex));
        assertTrue(visited.contains(vertex1));

        // Verify it's a copy
        visited.clear();
        assertEquals(2, tourState.getVisited().size());
    }
}