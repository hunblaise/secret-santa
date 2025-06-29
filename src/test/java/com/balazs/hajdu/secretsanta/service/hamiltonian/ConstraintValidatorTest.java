package com.balazs.hajdu.secretsanta.service.hamiltonian;

import com.balazs.hajdu.secretsanta.domain.Vertex;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ConstraintValidatorTest {

    private ConstraintValidator validator;

    @BeforeEach
    void setUp() {
        Map<String, List<String>> exclusions = Map.of(
            "alice", List.of("bob"),      // Alice can't give to Bob
            "charlie", List.of("diana")   // Charlie can't give to Diana
        );
        
        Map<String, String> cheats = Map.of(
            "bob", "charlie"              // Bob must give to Charlie
        );
        
        validator = new ConstraintValidator(exclusions, cheats);
    }

    @Test
    void shouldValidateValidMove() {
        // given
        Vertex alice = new Vertex("alice");
        Vertex charlie = new Vertex("charlie");

        // when & then - Alice to Charlie is valid (no exclusion, no cheat)
        assertTrue(validator.isValidMove(alice, charlie));
    }

    @Test
    void shouldRejectExcludedMove() {
        // given
        Vertex alice = new Vertex("alice");
        Vertex bob = new Vertex("bob");

        // when & then - Alice to Bob is excluded
        assertFalse(validator.isValidMove(alice, bob));
    }

    @Test
    void shouldEnforceCheatMove() {
        // given
        Vertex bob = new Vertex("bob");
        Vertex charlie = new Vertex("charlie");
        Vertex diana = new Vertex("diana");

        // when & then
        assertTrue(validator.isValidMove(bob, charlie));  // Bob must give to Charlie
        assertFalse(validator.isValidMove(bob, diana));   // Bob can't give to anyone else
    }

    @Test
    void shouldHandleNullConstraints() {
        // given
        ConstraintValidator nullValidator = new ConstraintValidator(null, null);
        Vertex alice = new Vertex("alice");
        Vertex bob = new Vertex("bob");

        // when & then - should allow all moves when no constraints
        assertTrue(nullValidator.isValidMove(alice, bob));
    }

    @Test
    void shouldFilterValidTargets() {
        // given
        Vertex alice = new Vertex("alice");
        Set<Vertex> possibleTargets = Set.of(
            new Vertex("bob"),     // Excluded
            new Vertex("charlie"), // Valid
            new Vertex("diana")    // Valid
        );

        // when
        Set<Vertex> validTargets = validator.filterValidTargets(alice, possibleTargets);

        // then
        assertEquals(2, validTargets.size());
        assertFalse(validTargets.contains(new Vertex("bob")));
        assertTrue(validTargets.contains(new Vertex("charlie")));
        assertTrue(validTargets.contains(new Vertex("diana")));
    }

    @Test
    void shouldValidateCompletePath() {
        // given - valid path that respects constraints: alice -> charlie -> alice
        List<Vertex> validPath = List.of(
            new Vertex("alice"),
            new Vertex("charlie")
        );

        List<Vertex> invalidPath = List.of(
            new Vertex("alice"),
            new Vertex("bob")     // Alice can't give to Bob (exclusion)
        );
        
        // Path with cheat violation: bob -> alice (but Bob must give to Charlie)
        List<Vertex> cheatViolationPath = List.of(
            new Vertex("bob"),
            new Vertex("alice")   // Bob must give to Charlie, not Alice
        );

        // when & then
        assertTrue(validator.validateCompletePath(validPath));
        assertFalse(validator.validateCompletePath(invalidPath));
        assertFalse(validator.validateCompletePath(cheatViolationPath));
    }

    @Test
    void shouldDetectUnsatisfiableRemainingCheats() {
        // given
        Set<Vertex> remainingVertices = Set.of(
            new Vertex("bob"),
            new Vertex("alice")  // Charlie (Bob's required target) is not remaining
        );

        // when & then - Bob needs Charlie, but Charlie is not available
        assertFalse(validator.canSatisfyRemainingCheats(remainingVertices));
    }

    @Test
    void shouldAllowSatisfiableRemainingCheats() {
        // given
        Set<Vertex> remainingVertices = Set.of(
            new Vertex("bob"),
            new Vertex("charlie"), // Charlie is available for Bob's cheat
            new Vertex("alice")
        );

        // when & then
        assertTrue(validator.canSatisfyRemainingCheats(remainingVertices));
    }

    @Test
    void shouldGetCheatTarget() {
        // when & then
        assertEquals("charlie", validator.getCheatTarget(new Vertex("bob")));
        assertNull(validator.getCheatTarget(new Vertex("alice")));
    }

    @Test
    void shouldDetectHasCheat() {
        // when & then
        assertTrue(validator.hasCheat(new Vertex("bob")));
        assertFalse(validator.hasCheat(new Vertex("alice")));
    }
}