# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Spring Boot application that generates Secret Santa pairs for a group of people. The application creates a graph-based solution where participants are matched while respecting exclusions (people who shouldn't be paired together) and optional "cheat" mappings for predetermined pairs.

## Key Technologies

- **Spring Boot 3.4.5** with WebFlux (reactive programming)
- **Java 21 LTS** (Long-Term Support until 2031)
- **Maven** for dependency management and build
- **Jakarta Mail** for email notifications (migrated from JavaMail)
- **JaCoCo 0.8.13** for code coverage
- **Mockito 5.15.2** for testing
- **Docker** deployment via Jib plugin 3.4.6

## Essential Commands

### Build and Test
```bash
# Clean build with tests
./mvnw clean install

# Run tests only
./mvnw test

# Run a specific test class
./mvnw test -Dtest=HamiltonianTourServiceTest

# Run a specific test method
./mvnw test -Dtest=HamiltonianTourServiceTest#shouldCreateValidHamiltonianCycleFromComplexGraph

# Generate code coverage report
./mvnw jacoco:report
```

### Running the Application
```bash
# Run locally
./mvnw spring-boot:run

# Build and run Docker image
./mvnw jib:dockerBuild
```

### Docker Deployment
```bash
# Build and push to Docker Hub (requires deploy-docker profile)
./mvnw deploy jib:build -P deploy-docker
```

## Modernization Updates (2024)

This project has been updated from legacy versions to modern, secure versions:

### Version Upgrades
- **Java 14 → Java 21 LTS**: Eliminates EOL security risks, provides LTS until 2031
- **Spring Boot 2.2.1 → 3.4.5**: Fixes critical CVE-2022-27772 and other vulnerabilities
- **Mockito 3.6.0 → 5.15.2**: Enhanced mocking capabilities with Java 11+ support
- **Maven Surefire 3.0.0-M5 → 3.5.3**: Latest test runner with better performance
- **JaCoCo 0.8.6 → 0.8.13**: Updated code coverage with Java 22 support
- **Jib 2.7.0 → 3.4.6**: Improved Docker image building
- **Docker base image**: `openjdk:14-alpine` → `eclipse-temurin:21-jre-alpine`

### Security Improvements
- Eliminated critical CVE-2022-27772 (temp directory hijacking vulnerability)
- Removed EOL Java 14 security risks
- Updated to supported LTS versions with active security patches

### Algorithm Upgrade
- **Replaced DummyHamiltonianTourService**: Upgraded from random assignment to real graph theory algorithm
- **Guaranteed Valid Assignments**: New algorithm ensures everyone gives and receives exactly one gift
- **Constraint Handling**: Proper validation of exclusions and predetermined assignments
- **Comprehensive Testing**: Added extensive test coverage for edge cases and constraint scenarios

## Architecture

### Core Components

1. **SecretSantaController** (`src/main/java/.../controller/`)
   - Single REST endpoint: `POST /generatePairs`
   - Uses reactive streams (Flux/Mono) for processing
   - Orchestrates the entire Secret Santa generation flow

2. **GraphMappingService** (`src/main/java/.../service/`)
   - Converts participant emails into a graph structure
   - Handles exclusions (people who can't be paired)
   - Supports "cheat" mappings for predetermined pairs

3. **HamiltonianTourService** (`src/main/java/.../service/`)
   - **Real Hamiltonian cycle algorithm** using backtracking with constraint propagation
   - Guarantees valid Secret Santa assignments where everyone gives and receives exactly one gift
   - Handles constraints through exclusions and predetermined assignments
   - Includes fallback strategy for impossible scenarios
   - **Supporting classes:**
     - `TourState`: Tracks path construction and backtracking state
     - `ConstraintValidator`: Validates moves against exclusions and requirements

4. **MailingService** (`src/main/java/.../service/`)
   - Sends notification emails to participants
   - Uses Spring Mail with Gmail SMTP configuration
   - Hungarian language email templates
   - Gracefully handles null mappings with email fallbacks

### Domain Models

- **SecretSantaRequest**: Input containing emails, exclusions, mappings, and email settings
- **Graph/Vertex**: Represents the participant network with allowed connections
- **Pair**: Output representing giver -> recipient relationship

### Reactive Flow

The application uses Project Reactor patterns:
```
SecretSantaRequest → GraphMappingService → HamiltonianTourService → Email Notifications
```

### Algorithm Details

The **HamiltonianTourService** implements a sophisticated algorithm:

1. **Graph Analysis**: Converts adjacency list to constraint-aware representation
2. **Backtracking Search**: Tries all possible paths using depth-first search
3. **Constraint Validation**: Checks exclusions and predetermined assignments at each step
4. **Early Pruning**: Eliminates impossible branches before full exploration
5. **Cycle Completion**: Ensures path returns to start vertex for valid Secret Santa assignment
6. **Fallback Strategy**: Provides best-effort assignment when perfect cycle impossible

**Time Complexity**: O(N!) worst case, but optimized with constraint pruning
**Space Complexity**: O(N) for path tracking and visited set

## Configuration

### Environment Variables Required
- `SECRET_SANTA_GMAIL_USERNAME`: Gmail account for sending emails
- `SECRET_SANTA_GMAIL_PASSWORD`: Gmail app password

### Email Configuration
Gmail SMTP is configured in `application.properties` with TLS encryption.

## Testing

### Test Structure
- **HamiltonianTourServiceTest**: Tests the core algorithm with various graph scenarios
- **ConstraintValidatorTest**: Tests constraint validation logic (exclusions, cheats)
- **TourStateTest**: Tests path construction and backtracking state management
- **Integration Tests**: MailingService, GraphMappingService with comprehensive edge cases

### Test Coverage
- Uses Mockito 5.x with @ExtendWith(MockitoExtension.class) for modern mocking
- JaCoCo excludes domain objects and main application class from coverage
- Tests include scenarios: valid cycles, impossible graphs, constraint violations, fallback strategies

### Key Test Files
```bash
# Run all algorithm tests
./mvnw test -Dtest=HamiltonianTourServiceTest

# Run constraint validation tests  
./mvnw test -Dtest=ConstraintValidatorTest

# Run all tests in hamiltonian package
./mvnw test -Dtest="com.balazs.hajdu.secretsanta.service.hamiltonian.*"
```

## CI/CD

Travis CI configuration (`.travis.yml`):
- Builds with OpenJDK 21 (updated from 14)
- Runs `./mvnw clean install`
- Builds and pushes Docker image to Docker Hub
- Requires Docker Hub credentials as environment variables

## Important Implementation Notes

### Null Safety
All services now handle null inputs gracefully:
- **GraphMappingService**: Checks for null cheats and exclusions maps
- **MailingService**: Falls back to email addresses when name mappings are null
- **ConstraintValidator**: Handles null constraint maps without exceptions

### Algorithm Behavior
- **Deterministic with Randomization**: Algorithm tries multiple starting points for optimal solutions
- **Constraint Priority**: Cheats (predetermined assignments) take precedence over exclusions
- **Fallback Strategy**: When no perfect Hamiltonian cycle exists, provides best-effort partial assignment
- **Performance**: Efficiently handles typical Secret Santa groups (≤20 people) with constraint pruning