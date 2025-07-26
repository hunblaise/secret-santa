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

### Algorithm Implementation
- **Real Graph Theory Algorithm**: Uses backtracking with constraint propagation for optimal assignments
- **Guaranteed Valid Assignments**: Algorithm ensures everyone gives and receives exactly one gift
- **Constraint Handling**: Proper validation of exclusions and predetermined assignments
- **Comprehensive Testing**: Extensive test coverage for edge cases and constraint scenarios

### Current Architecture Features
- **Clean Controller**: Focused HTTP layer with single responsibility
- **Service Layer Pattern**: SecretSantaOrchestrationService coordinates business operations
- **Strategy Pattern**: Pluggable email delivery strategies (sync/async)
- **Builder Pattern**: SecretSantaResponseBuilder for response creation
- **Transactional Email**: Enhanced email delivery with retry logic and status tracking
- **Clean Architecture**: Proper separation of HTTP, business, and domain concerns

## Architecture

### Clean Architecture Layers

#### 1. Controller Layer (HTTP Boundary)
**SecretSantaController** (`src/main/java/.../controller/`)
- **Single Responsibility**: HTTP request/response handling only
- Single REST endpoint: `POST /generatePairs`
- **Thin Layer**: Delegates all business logic to orchestration service
- Uses reactive streams (Mono) for non-blocking processing

#### 2. Service/Business Layer
**SecretSantaOrchestrationService** (`src/main/java/.../service/`)
- **Main Business Coordinator**: Orchestrates entire Secret Santa generation flow
- Coordinates: Graph generation → Hamiltonian tour → Email delivery
- Handles business errors and response building
- Supports delivery mode overrides (sync/async)

**SecretSantaResponseBuilder** (`src/main/java/.../service/`)
- **Response Creation Logic**: Encapsulates response building rules
- Handles different response types (success/failure/email variants)
- Separates response construction from business logic

**Email Delivery Strategy Pattern:**
- `EmailDeliveryStrategy` (Interface): Contract for delivery approaches
- `SynchronousEmailDeliveryStrategy`: Transactional email delivery with wait
- `AsynchronousEmailDeliveryStrategy`: Fire-and-forget background delivery
- `EmailDeliveryStrategyFactory`: Strategy selection based on configuration

#### 3. Core Algorithm Services
**GraphMappingService** (`src/main/java/.../service/`)
- Converts participant emails into graph structure
- Handles exclusions (people who can't be paired)
- Supports "cheat" mappings for predetermined pairs
- Validates graph constraints

**HamiltonianTourService** (`src/main/java/.../service/`)
- **Real Hamiltonian cycle algorithm** using backtracking with constraint propagation
- Guarantees valid Secret Santa assignments where everyone gives and receives exactly one gift
- Handles constraints through exclusions and predetermined assignments
- Includes fallback strategy for impossible scenarios
- **Supporting classes:**
  - `TourState`: Tracks path construction and backtracking state
  - `ConstraintValidator`: Validates moves against exclusions and requirements

**TransactionalMailingService** (`src/main/java/.../service/`)
- **Enhanced Email Delivery**: Batch and individual email sending
- **Retry Logic**: Configurable retry attempts with error handling
- **Status Tracking**: Detailed delivery status per email recipient
- **Transactional Behavior**: All-or-nothing batch mode option
- Hungarian language email templates
- Gracefully handles null mappings with email fallbacks

### Domain Models

**Core Request/Response:**
- **SecretSantaRequest**: Input containing emails, exclusions, mappings, and email settings
- **SecretSantaResponse**: Enhanced response with pairs, email status, and error details
- **Pair**: Output representing giver → recipient relationship

**Graph Theory Models:**
- **Graph/Vertex**: Represents the participant network with allowed connections
- **EmailDeliveryResult**: Value object containing delivery status and individual results

**Email Status Tracking:**
- **EmailStatus**: Overall delivery status (SUCCESS, FAILED, PARTIAL, PENDING, DISABLED)
- **EmailResult**: Individual email delivery result (DELIVERED, FAILED, PENDING, SKIPPED)

### Reactive Flow

The application uses Project Reactor patterns with clean layer separation:

**HTTP Layer:**
```
HTTP Request → SecretSantaController → SecretSantaOrchestrationService
```

**Business Layer:**
```
SecretSantaRequest → GraphMappingService → HamiltonianTourService → EmailDeliveryStrategy → SecretSantaResponseBuilder
```

**Email Delivery Strategies:**
```
# Synchronous Mode (Default)
EmailStrategy → TransactionalMailingService → Wait for completion → Return actual status

# Asynchronous Mode  
EmailStrategy → TransactionalMailingService.subscribe() → Return PENDING immediately
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

### Email Configuration Properties
```properties
# Gmail SMTP configuration (in application.properties)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Email delivery behavior
secret-santa.email.delivery.mode=sync          # sync|async
secret-santa.email.retry.attempts=3            # Number of retry attempts
secret-santa.email.retry.delay=1000           # Delay between retries (ms)
secret-santa.email.batch.enabled=true         # Enable batch email sending
```

### Email Delivery Modes
- **Sync Mode (default)**: API waits for all emails to complete, returns actual delivery status
- **Async Mode**: API returns immediately with PENDING status, emails sent in background

## Testing

### Test Structure

**Algorithm Tests:**
- **HamiltonianTourServiceTest**: Tests the core algorithm with various graph scenarios
- **ConstraintValidatorTest**: Tests constraint validation logic (exclusions, cheats)
- **TourStateTest**: Tests path construction and backtracking state management

**Service Layer Tests:**
- **SecretSantaOrchestrationServiceTest**: Tests business flow coordination
- **TransactionalMailingServiceTest**: Tests email delivery with retry logic
- **SecretSantaControllerTransactionalTest**: Tests HTTP layer with mocked orchestration

**Strategy Pattern Tests:**
- **EmailDeliveryStrategyFactoryTest**: Tests strategy selection logic
- **SynchronousEmailDeliveryStrategyTest**: Tests transactional email behavior
- **AsynchronousEmailDeliveryStrategyTest**: Tests fire-and-forget email behavior

**Integration Tests:**
- **GraphMappingService**, **MailingService** with comprehensive edge cases

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

# Run orchestration service tests
./mvnw test -Dtest=SecretSantaOrchestrationServiceTest

# Run email strategy tests
./mvnw test -Dtest="*EmailDelivery*Test"

# Run transactional email tests
./mvnw test -Dtest=TransactionalMailingServiceTest

# Run controller tests (now thin integration tests)
./mvnw test -Dtest=SecretSantaControllerTransactionalTest
```

## CI/CD

Travis CI configuration (`.travis.yml`):
- Builds with OpenJDK 21 (updated from 14)
- Runs `./mvnw clean install`
- Builds and pushes Docker image to Docker Hub
- Requires Docker Hub credentials as environment variables

## Important Implementation Notes

### Null Safety
All services handle null inputs gracefully:
- **GraphMappingService**: Checks for null cheats and exclusions maps
- **TransactionalMailingService**: Falls back to email addresses when name mappings are null
- **ConstraintValidator**: Handles null constraint maps without exceptions

### Algorithm Behavior
- **Deterministic with Randomization**: Algorithm tries multiple starting points for optimal solutions
- **Constraint Priority**: Cheats (predetermined assignments) take precedence over exclusions
- **Fallback Strategy**: When no perfect Hamiltonian cycle exists, provides best-effort partial assignment
- **Performance**: Efficiently handles typical Secret Santa groups (≤20 people) with constraint pruning

### Email Delivery Behavior
- **Transactional Semantics**: Batch mode ensures all emails succeed or detailed failure reporting
- **Individual Retry**: Per-email retry logic with configurable attempts
- **Graceful Degradation**: Secret Santa pairs always generated even if emails fail
- **Status Granularity**: Individual email delivery tracking (DELIVERED/FAILED/PENDING/SKIPPED)
- **Early Validation**: Email configuration validated before sending attempts

### Design Patterns Used
- **Strategy Pattern**: Email delivery strategies (sync/async)
- **Builder Pattern**: Response construction with SecretSantaResponseBuilder
- **Service Layer**: Clean separation between HTTP and business logic
- **Dependency Inversion**: Services depend on abstractions, not concrete implementations
- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Easy to extend with new email strategies without modifying existing code

## Architecture Principles

The application follows clean architecture principles and design patterns:

### Key Benefits
- **Focused Controller**: HTTP layer handles only request/response concerns
- **Loose Coupling**: Clean dependency injection with interface abstractions
- **Easy Testing**: Business logic independently testable with focused mocks
- **High Extensibility**: New email strategies via strategy pattern
- **Maintainability**: Clear boundaries between architectural layers

### SOLID Principles Compliance
- **S**: Single Responsibility - Each class has one clear purpose
- **O**: Open/Closed - Easy to extend email strategies without modification
- **L**: Liskov Substitution - Email strategies are interchangeable
- **I**: Interface Segregation - Focused interfaces like EmailDeliveryStrategy
- **D**: Dependency Inversion - Services depend on abstractions

## Quick Reference for Claude Code

### Key Architecture Components
```
HTTP Layer:    SecretSantaController (thin, delegates to orchestration)
Business:      SecretSantaOrchestrationService (main coordinator)
Strategies:    EmailDeliveryStrategy implementations (sync/async)
Response:      SecretSantaResponseBuilder (response creation)
Algorithm:     HamiltonianTourService (graph theory)
Email:         TransactionalMailingService (retry logic, status tracking)
```

### Common Development Tasks
- **Add new email delivery strategy**: Implement EmailDeliveryStrategy interface
- **Modify business flow**: Edit SecretSantaOrchestrationService
- **Change response format**: Update SecretSantaResponseBuilder
- **Algorithm improvements**: Modify HamiltonianTourService or supporting classes
- **Email behavior changes**: Update TransactionalMailingService
- **API changes**: Only modify SecretSantaController for HTTP concerns

### Testing Strategy
- **Business Logic**: Test orchestration service with mocked dependencies
- **Strategies**: Test each email delivery strategy independently
- **Controller**: Integration tests via orchestration service mock
- **Algorithm**: Comprehensive edge case testing in HamiltonianTourServiceTest