# Backend review and modernization

Reviewed on 2026-10-17. Applied the installed TypeSafe skill's guidance to keep exact business rules in code and verify representative failures and resulting application behavior. The backend's assignment rules are deterministic constraints; this change does not require an AI service or credentials.

## Findings addressed

| Finding | Result |
| --- | --- |
| Impossible graphs returned a greedy subset of pairs and could trigger emails | Generation now emits a complete single cycle or fails before sending any email |
| Forced pairs bypassed exclusions and could reference outsiders, oneself, or a duplicate recipient | Request validation rejects these conflicts before graph construction |
| Duplicate participants silently collapsed into graph keys; missing lists failed inconsistently | Validation requires 2–100 unique, nonblank participants and validates all constraint references |
| Traversal followed collection order and repeatedly searched every possible start | Shuffled candidates and start provide randomized draws; one start suffices to find a Hamiltonian cycle |
| Explicit-constraint pruning rejected valid closing edges; fallback ignored explicit constraints | Every candidate, including the closing edge, must satisfy the graph and supplied constraints |
| Exponential search ran on the WebFlux event loop with no bound | Search runs on bounded elastic workers and stops after 200,000 recursive steps |
| Blocking HTTP email calls ran on the event loop; retry delay was unused | HTTP work uses bounded elastic workers and exponential backoff for transient failures |
| Retries could send the same email twice | Each email attempt chain shares a Resend idempotency key |
| Batch and individual delivery both used unbounded default `flatMap` concurrency | Batch delivery permits two concurrent requests; individual mode is sequential |
| Failed background delivery lacked a subscriber error handler | Async subscriber explicitly handles terminal errors |

## Stack

- Spring Boot 3.4.5 → 4.1.1, including its managed Spring Framework, Reactor, Jackson, JUnit, Mockito, and Maven plugins.
- Resend Java SDK 3.0.0 → 4.28.0.
- Retained Java 21 bytecode/runtime baseline and Java 21 Jib image.
- Removed old explicit compiler, Surefire, and Mockito versions in favor of Spring Boot's dependency management.
- Pinned Node.js 24.22.0 in `.nvmrc`. Existing Next.js 16 / React 19 dependencies were already modernized.
- Added GitHub Actions checks for backend verification and frontend typechecking, lint, tests, and production build.

Version sources: [Spring Boot migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide), [Spring Boot Maven metadata](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/maven-metadata.xml), [Resend Maven metadata](https://repo.maven.apache.org/maven2/com/resend/resend-java/maven-metadata.xml). Skill: [TypeSafe](../.agents/skills/typesafe-ai/SKILL.md).

## Verification and compatibility

The original 74 backend tests passed before changes. Updated tests replace partial-draw expectations with failure assertions. The upgraded backend passes 86 tests and `mvnw verify`, including a real HTTP server test for Jackson serialization, forced pairs, invalid requests, and impossible draws. Email tests use a mocked Resend client and exercise transient retries, permanent failures, stable idempotency keys, and worker-thread execution.

Frontend verification passed: typecheck, lint (one existing unused-import warning), all 174 tests across 13 files, and the Next.js production build. The build retains existing warnings about `metadataBase` and the deprecated metadata `themeColor` field.

The `/generatePairs` route and response fields remain compatible. Business failures retain the existing HTTP 200 response envelope with `emailStatus: FAILED`, empty pairs, and an errors list. Malformed JSON still uses framework HTTP error responses. Clients that relied on incomplete draws must now display the failure. Email-enabled requests require email-shaped participant identifiers; email-disabled draws can use names.

Local verification used the already installed JDK 24.0.1 with `--release 21`; the machine's default `JAVA_HOME` still points to Java 14. Set `JAVA_HOME` to a compatible JDK before local Maven commands. GitHub Actions is configured to verify on Java 21; remote CI has not been run from this session.

## Remaining operational limits

- Randomized search does not promise a uniform distribution of all valid cycles. The search limit can reject a difficult satisfiable draw; its error distinguishes this from proven impossibility.
- Async delivery remains in memory, returns `PENDING`, and has no status polling endpoint or restart recovery. Keep synchronous mode for final delivery results; durable jobs require storage and a queue.
- `DELIVERED` means Resend accepted the request, not confirmed inbox delivery. Confirmation needs provider webhooks.
- Idempotency protects retries within one send operation. Reposting a whole draw creates a new draw and new idempotency keys.
- Per-request concurrency limits are not a global provider rate limiter. Public email endpoints still need deployment-level abuse controls and provider quota monitoring.
- Real email delivery and Docker image publication were not exercised.
