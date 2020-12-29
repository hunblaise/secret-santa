package com.balazs.hajdu.secretsanta.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.balazs.hajdu.secretsanta.domain.Graph;
import com.balazs.hajdu.secretsanta.domain.Vertex;
import com.balazs.hajdu.secretsanta.domain.response.Pair;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Balazs_Hajdu
 */
@Service
public class DummyHamiltonianTourService {

    public Flux<Pair> generateSecretSantaPairs(Mono<Graph> graph) {
        List<Vertex> alreadyUsedVertices = new ArrayList<>();
        return graph.map(Graph::getVertices)
                .map(Map::entrySet)
                .flatMapMany(Flux::fromIterable)
                .map(fromVertex -> generatePairFromEntry(fromVertex, alreadyUsedVertices));
    }

    private Pair generatePairFromEntry(Map.Entry<Vertex, List<Vertex>> fromVertex, List<Vertex> alreadyUsedVertices) {
        Random random = new Random();
        List<Vertex> possiblePairs = fromVertex.getValue();
        possiblePairs.removeAll(alreadyUsedVertices);
        Vertex generatedPair = possiblePairs.get(random.nextInt(possiblePairs.size()));
        alreadyUsedVertices.add(generatedPair);
        return new Pair(fromVertex.getKey().getLabel(), generatedPair.getLabel());
    }

}
