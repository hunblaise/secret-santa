package com.balazs.hajdu.secretsanta.domain;

import java.util.Objects;

/**
 * @author Balazs_Hajdu
 */
public class Vertex {
    private final String label;

    public Vertex(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    @Override
    public int hashCode() {
        return Objects.hash(label);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        final Vertex other = (Vertex) obj;
        return Objects.equals(this.label, other.label);
    }

    @Override
    public String toString() {
        return "Vertex{"
            + "label='" + label + '\''
            + '}';
    }
}
