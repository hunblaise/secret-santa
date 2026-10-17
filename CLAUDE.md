# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **full-stack Secret Santa application** consisting of a modern React frontend and a Spring Boot backend. The application provides an intuitive web interface for generating Secret Santa pairs while respecting complex constraints and preferences.

**Frontend**: A Next.js/React application with Christmas-themed design, real-time validation, advanced options, and comprehensive user experience.

**Backend**: A Spring Boot application with sophisticated graph-based algorithms that generates Secret Santa pairs while respecting exclusions (people who shouldn't be paired together) and optional "cheat" mappings for predetermined pairs.

**Integration**: The frontend consumes RESTful APIs from the backend, providing a seamless full-stack experience for Secret Santa generation with email delivery capabilities.

## Key Technologies

### Backend Stack
- **Spring Boot 3.4.5** with WebFlux (reactive programming)
- **Java 21 LTS** (Long-Term Support until 2031)
- **Maven** for dependency management and build
- **Jakarta Mail** for email notifications (migrated from JavaMail)
- **JaCoCo 0.8.13** for code coverage
- **Mockito 5.15.2** for testing
- **Docker** deployment via Jib plugin 3.4.6

### Frontend Stack
- **Next.js 15.5.2** with Turbopack for fast development and hot reloading
- **React 18** with TypeScript for type-safe UI development
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** with custom Christmas design system and semantic colors
- **React Hook Form + Zod** for form validation and schema validation
- **Vitest** testing framework with 170+ comprehensive test cases
- **Lucide React** for consistent iconography
- **Sonner** for toast notifications
- **Vercel** deployment platform with automatic deployments

## Essential Commands

### Backend Commands
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

# Run backend locally
./mvnw spring-boot:run

# Build and run Docker image
./mvnw jib:dockerBuild

# Build and push to Docker Hub (requires deploy-docker profile)
./mvnw deploy jib:build -P deploy-docker
```

### Frontend Commands
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run frontend tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Full-Stack Development Workflow
```bash
# Terminal 1: Start backend (from project root)
cd backend && ./mvnw spring-boot:run

# Terminal 2: Start frontend (from project root)
cd frontend && npm run dev

# Access application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
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

This section covers both frontend and backend architecture patterns and design principles.

### Backend Architecture (Clean Architecture Layers)

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

### Frontend Architecture (Modern React Patterns)

#### 1. Component Architecture
**Page Level** (`app/page.tsx`)
- **Main Application**: Single-page app with responsive layout
- **Christmas Theme**: Comprehensive design system with semantic colors
- **Layout Structure**: Hero section + main form with 60/40 split layout

**Component Layer** (`components/secret-santa/`)
- **ParticipantForm**: Main form orchestrator with React Hook Form
- **EnhancedEmailInput**: Real-time email validation with visual feedback
- **AdvancedOptions**: Tabbed interface for exclusions, forced pairings, name mappings
- **ResultsDisplay**: Success animations, confetti effects, export functionality

**UI Components** (`components/ui/`)
- **shadcn/ui**: Pre-built accessible components (Button, Card, Tabs, etc.)
- **Design System**: Christmas color palette with semantic meaning
- **Responsive**: Mobile-first design with progressive enhancement

#### 2. State Management & Validation
**Form State** (React Hook Form + Zod)
- **Type-Safe Forms**: Zod schema validation with TypeScript integration
- **Real-Time Validation**: Field-level and cross-field validation
- **Error Handling**: Comprehensive error states and user feedback

**Advanced Validation Features:**
- **Field-Aware Validation**: Prevents false duplicate warnings during editing
- **Cross-Validation**: Detects conflicts between exclusions and forced pairings
- **Email Validation**: Real-time email format and duplicate detection

#### 3. API Integration Layer
**Client-Side API** (`lib/api.ts`)
- **RESTful Integration**: Consumes Spring Boot backend APIs
- **Error Handling**: Comprehensive error states and user feedback
- **Type Safety**: TypeScript interfaces for all API responses

**Request/Response Flow:**
```
User Input → Form Validation → API Call → Response Processing → UI Update
```

#### 4. Design System (2025 Redesign)
**Advanced UI/UX Design System** (`app/globals.css`)

The frontend features a sophisticated design system following professional UI/UX principles:

**Layered Color System:**
- **4-5 shade systems** for each base color (Red, Green, Gold, Neutral, Blue)
- **Hierarchy Principle**: Darker shades = deeper layers/backgrounds, Lighter shades = elevated surfaces
- **Semantic Mappings**: Colors include hover/active states using the shade system
- Example: `--red-900` (deep burgundy) → `--red-500` (Christmas Red) → `--red-100` (rose)

**Sophisticated Shadow System:**
- **Dual-Shadow Technique**: Combines light (top) + dark (bottom) shadows for realism
- **Three Depth Levels**:
  - `.shadow-subtle`: For inputs and minor elevation
  - `.shadow-standard`: For cards and standard surfaces
  - `.shadow-prominent`: For hover states and emphasized elements
- **Button-Specific Shadows**: `.shadow-button`, `.shadow-button-hover`, `.shadow-button-active`
- **Inset Shadows**: For pressed states and input fields (`.shadow-inset`, `.shadow-inset-polished`)
- **Light-From-Above Effect**: Simulates natural top-down lighting
- **Dark Mode Adjustments**: All shadow levels optimized for dark backgrounds

**System of Boxes Architecture:**
- **Structured Box Hierarchy**: Clear elevation levels (Layer 0-5)
- **Visual Depth**: Color layering + shadows create perception of depth
- **Purposeful Responsive**: Elements rearrange intelligently, not just resize

**Component Design Patterns:**
- **Gradient Enhancements**: Subtle gradients for polished, elevated surfaces
- **Micro-interactions**: 300ms smooth transitions for all state changes
- **Hover States**: Shadow elevation increases, gradient shifts
- **Focus States**: Ring glow with color transitions
- **Active States**: Inset shadows simulate button press
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

**Key Design Files:**
- `app/globals.css`: Complete color system, shadow utilities, animations
- `components/secret-santa/`: All components use the new design system
- `components/ui/`: shadcn/ui components styled with the system

**Important Design Notes:**
- **Avoid React Hydration Issues**: Use deterministic values (like index) instead of `Math.random()` in SSR components
- **Shadow Classes**: Always prefer custom shadow classes over Tailwind defaults
- **Color Usage**: Use CSS variables (`var(--red-500)`) for consistency across themes

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

This section covers testing strategies for both frontend and backend components.

### Backend Test Structure

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

### Frontend Test Structure

**Component Tests** (`__tests__/components/`)
- **Enhanced Email Input**: Real-time validation, duplicate detection, error handling
- **Advanced Options**: Form validation, field-aware duplicate prevention, tab interactions
- **Participant Form**: Main form flow, live preview, responsiveness
- **Results Display**: Success animations, export functionality, error states
- **UI Components**: Button, Card, Tabs, and other shadcn/ui component tests

**Integration Tests** (`__tests__/components/secret-santa/`)
- **Advanced Options Integration**: Full form submission with complex validation scenarios
- **Field-Aware Validation**: Tests for bug fixes preventing false duplicate warnings
- **Cross-Component Integration**: Email input + advanced options + form submission flow

**Utility Tests** (`__tests__/lib/`)
- **API Integration**: Request/response handling, error scenarios
- **Form Validation**: Email parsing, validation utils, type transformations

### Frontend Test Coverage
- **170+ Tests**: Comprehensive test suite with excellent coverage
- **Testing Framework**: Vitest with React Testing Library for modern component testing
- **Mock Strategies**: API mocking, user event simulation, form state testing
- **Validation Testing**: Field-level, cross-field, and integration validation scenarios

**Test Maintenance Notes:**
- After design system updates, tests may need selector adjustments
- Use flexible matchers: `[class*="shadow"]` instead of exact class names
- Use regex for split text: `/Enter one email.*per line/` for text across multiple elements
- Test design intent, not implementation: Check for gradient backgrounds instead of specific classes
- Example: `expect(badge.className).toMatch(/bg-gradient-to-br.*from-green-500/)` for success states

### Key Frontend Test Commands
```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test advanced-options
npm test enhanced-email-input
npm test participant-form

# Run tests in watch mode
npm test --watch
```

**Critical Test Scenarios:**
- **Field-Aware Validation**: Prevents false duplicate warnings during editing
- **Real-Time Email Validation**: Format validation, duplicate detection, error display
- **Cross-Component Integration**: Form submission with advanced options
- **Responsive Design**: Mobile and desktop layout testing
- **Accessibility**: Screen reader compatibility, keyboard navigation

## CI/CD

Travis CI configuration (`.travis.yml`):
- Builds with OpenJDK 21 (updated from 14)
- Runs `./mvnw clean install`
- Builds and pushes Docker image to Docker Hub
- Requires Docker Hub credentials as environment variables

## Important Implementation Notes

### React Hydration (Frontend)
**Critical**: Components rendered on the server (SSR/SSG) must produce identical output on the client to avoid hydration mismatches.

**Common Issues:**
- Using `Math.random()` for positioning or styling - generates different values server vs client
- Using `Date.now()` or non-deterministic values in render
- Browser-only APIs (window, document) without proper checks

**Solution:**
- Use deterministic values based on component props (e.g., `index` for positioning)
- Use `useEffect` or `'use client'` directive for client-only logic
- Example: Snowflake positioning uses `((index * 7.3 + 13) % 100)` instead of `Math.random()`

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

### Full-Stack Testing Strategy

#### Backend Testing Strategy
- **Business Logic**: Test orchestration service with mocked dependencies
- **Strategies**: Test each email delivery strategy independently
- **Controller**: Integration tests via orchestration service mock
- **Algorithm**: Comprehensive edge case testing in HamiltonianTourServiceTest

#### Frontend Testing Strategy
- **Component Testing**: Isolated component testing with React Testing Library
- **Integration Testing**: Cross-component interaction and form submission flows
- **Validation Testing**: Field-aware validation logic and error scenarios
- **User Experience Testing**: Accessibility, responsive design, and user interactions
- **API Integration Testing**: Frontend-backend communication with mocked responses

#### End-to-End Integration
- **Full-Stack Flow**: User input → Frontend validation → API call → Backend processing → UI update
- **Error Scenarios**: Network failures, validation errors, and recovery flows
- **Performance Testing**: Form responsiveness, API response times, animation performance

## Full-Stack Development Workflow

### Frontend-Backend Integration

**API Endpoints:**
```
POST /generatePairs - Main Secret Santa generation endpoint
CORS enabled for frontend development (http://localhost:3000)
```

**Request/Response Flow:**
```
1. User fills form in React frontend
2. Frontend validates input (emails, exclusions, etc.)
3. API call to Spring Boot backend
4. Backend processes with Hamiltonian algorithm
5. Response with pairs + email status
6. Frontend displays results with animations
```

**Development Environment Setup:**
```bash
# Terminal 1: Backend (Java Spring Boot)
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080

# Terminal 2: Frontend (Next.js)
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Integration Points

**CORS Configuration** (`backend/src/main/java/.../config/CorsConfig.java`)
- Allows frontend development server access
- Configured for http://localhost:3000
- Enables credentials and common headers

**API Client** (`frontend/lib/api.ts`)
- TypeScript interfaces for all backend responses
- Error handling for network failures
- Request/response transformation

**Data Flow:**
```
Frontend Form → Validation → API Request → Backend Processing → Email Delivery → UI Update
```

### Development Best Practices

#### Frontend Development
1. **Component-First**: Build UI components independently
2. **Type Safety**: Use TypeScript interfaces for all API communication
3. **Validation**: Client-side validation with server-side backup
4. **Testing**: Test components, integration, and user flows
5. **Accessibility**: WCAG 2.1 AA compliance throughout

#### Backend Development
1. **Clean Architecture**: Maintain separation of concerns
2. **Testing**: Comprehensive unit and integration tests
3. **Error Handling**: Graceful degradation for all scenarios
4. **Performance**: Optimize algorithms for typical group sizes
5. **Security**: Input validation and secure email handling

#### Integration Development
1. **API-First**: Design backend APIs with frontend needs in mind
2. **Error Handling**: Consistent error responses across the stack
3. **Type Safety**: Shared interfaces between frontend and backend
4. **Testing**: End-to-end testing of complete user journeys
5. **Documentation**: Keep API documentation current

### Deployment Architecture

**Frontend (Vercel)**
- Next.js automatic deployments
- Environment variables for API endpoints
- Performance optimization with Turbopack

**Backend (Docker)**
- Containerized Spring Boot application
- Environment variables for email configuration
- Health checks and monitoring

**Integration**
- Frontend configured to call production backend API
- CORS properly configured for production domains
- SSL/TLS for secure communication

This full-stack architecture provides a robust, scalable Secret Santa application with modern development practices and comprehensive testing coverage.