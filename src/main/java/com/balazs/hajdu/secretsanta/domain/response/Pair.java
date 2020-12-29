package com.balazs.hajdu.secretsanta.domain.response;

/**
 * @author Balazs_Hajdu
 */
public class Pair {
    private final String from;
    private final String to;

    public Pair(String from, String to) {
        this.from = from;
        this.to = to;
    }

    public String getFrom() {
        return from;
    }

    public String getTo() {
        return to;
    }
}
