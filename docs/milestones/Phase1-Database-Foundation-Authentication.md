# Phase 1: Database Foundation & Authentication

## Overview
This phase establishes the foundational database layer and authentication system for the Secret Santa web application. It transforms the current single-endpoint service into a proper web application backend with user management and data persistence.

## Prerequisites
- Existing Secret Santa algorithm implementation (✅ Complete)
- Spring Boot 3.4.5 + Java 21 setup (✅ Complete)
- Maven build system (✅ Complete)

## Objectives
- Add database persistence layer with JPA/Hibernate
- Implement user authentication with JWT tokens
- Create core entities for users, groups, and participants
- Establish security configuration for endpoint protection

## Milestone 1.1: Database Setup

### Tasks
1. **Add JPA/Hibernate Dependencies**
   ```xml
   <!-- Add to pom.xml -->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-jpa</artifactId>
   </dependency>
   <dependency>
       <groupId>com.h2database</groupId>
       <artifactId>h2</artifactId>
       <scope>runtime</scope>
   </dependency>
   <dependency>
       <groupId>org.postgresql</groupId>
       <artifactId>postgresql</artifactId>
       <scope>runtime</scope>
   </dependency>
   ```

2. **Configure Database Properties**
   - Create `application-dev.properties` for H2 development database
   - Create `application-prod.properties` for PostgreSQL production database
   - Update main `application.properties` with JPA settings

### Acceptance Criteria
- [ ] Maven build succeeds with new dependencies
- [ ] H2 console accessible in development mode
- [ ] Database schema creation works
- [ ] Connection pooling configured properly

## Milestone 1.2: User Entity & Repository Layer

### Tasks
1. **Create User Entity**
   ```java
   @Entity
   @Table(name = "users")
   public class User {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @Column(unique = true, nullable = false)
       private String email;
       
       @Column(nullable = false)
       private String firstName;
       
       @Column(nullable = false)
       private String lastName;
       
       @Column(nullable = false)
       private String passwordHash;
       
       private boolean emailVerified = false;
       
       @CreationTimestamp
       private LocalDateTime createdAt;
       
       @UpdateTimestamp
       private LocalDateTime updatedAt;
   }
   ```

2. **Create UserRepository**
   - Extend `JpaRepository<User, Long>`
   - Add custom query methods for email lookup
   - Add methods for user verification

3. **Add Password Encryption**
   - Configure BCrypt password encoder
   - Create password hashing utilities
   - Add password validation

### Acceptance Criteria
- [ ] User entity properly mapped to database
- [ ] CRUD operations work through repository
- [ ] Password encryption/verification functional
- [ ] Email uniqueness constraint enforced
- [ ] Audit fields (createdAt, updatedAt) populate automatically

## Milestone 1.3: Authentication System

### Tasks
1. **Add Spring Security Dependencies**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-security</artifactId>
   </dependency>
   <dependency>
       <groupId>io.jsonwebtoken</groupId>
       <artifactId>jjwt-api</artifactId>
       <version>0.12.3</version>
   </dependency>
   <dependency>
       <groupId>io.jsonwebtoken</groupId>
       <artifactId>jjwt-impl</artifactId>
       <version>0.12.3</version>
       <scope>runtime</scope>
   </dependency>
   <dependency>
       <groupId>io.jsonwebtoken</groupId>
       <artifactId>jjwt-jackson</artifactId>
       <version>0.12.3</version>
       <scope>runtime</scope>
   </dependency>
   ```

2. **Create JWT Configuration**
   - JWT token generation service
   - Token validation and parsing
   - Token refresh mechanism
   - Configurable token expiration

3. **Create Authentication DTOs**
   ```java
   public record LoginRequest(String email, String password) {}
   public record RegisterRequest(String email, String firstName, String lastName, String password) {}
   public record AuthResponse(String token, String refreshToken, UserDto user) {}
   public record ForgotPasswordRequest(String email) {}
   ```

### Acceptance Criteria
- [ ] JWT tokens generated correctly
- [ ] Token validation works properly
- [ ] Token expiration handled gracefully
- [ ] Refresh token mechanism functional

## Milestone 1.4: Authentication Controller

### Tasks
1. **Create AuthController**
   ```java
   @RestController
   @RequestMapping("/api/auth")
   public class AuthController {
       
       @PostMapping("/login")
       public Mono<ResponseEntity<AuthResponse>> login(@RequestBody LoginRequest request);
       
       @PostMapping("/register")
       public Mono<ResponseEntity<AuthResponse>> register(@RequestBody RegisterRequest request);
       
       @PostMapping("/forgot-password")
       public Mono<ResponseEntity<String>> forgotPassword(@RequestBody ForgotPasswordRequest request);
       
       @PostMapping("/refresh")
       public Mono<ResponseEntity<AuthResponse>> refresh(@RequestBody RefreshTokenRequest request);
   }
   ```

2. **Implement Authentication Service**
   - User registration with validation
   - Login with email/password
   - Password reset token generation
   - Email verification workflow

### Acceptance Criteria
- [ ] User registration endpoint works
- [ ] Login returns valid JWT token
- [ ] Password reset generates reset tokens
- [ ] Proper error handling for invalid credentials
- [ ] Input validation for all endpoints

## Milestone 1.5: Security Configuration

### Tasks
1. **Configure Security Filter Chain**
   - JWT authentication filter
   - CORS configuration for frontend
   - Exception handling for authentication errors
   - Public vs protected endpoints

2. **Create Security Components**
   ```java
   @Configuration
   @EnableWebFluxSecurity
   public class SecurityConfig {
       
       @Bean
       public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http);
       
       @Bean
       public ReactiveAuthenticationManager authenticationManager();
       
       @Bean
       public PasswordEncoder passwordEncoder();
   }
   ```

### Acceptance Criteria
- [ ] Public endpoints accessible without authentication
- [ ] Protected endpoints require valid JWT token
- [ ] CORS properly configured for frontend access
- [ ] Authentication errors return proper HTTP status codes

## Milestone 1.6: Core Domain Entities

### Tasks
1. **Create Group Entity**
   ```java
   @Entity
   public class Group {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       private String name;
       private String description;
       
       @ManyToOne
       @JoinColumn(name = "created_by_user_id")
       private User createdBy;
       
       @Enumerated(EnumType.STRING)
       private GroupStatus status; // DRAFT, ACTIVE, GENERATED, COMPLETED
       
       private LocalDateTime eventDate;
       private BigDecimal giftBudget;
       
       @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
       private List<Participant> participants = new ArrayList<>();
   }
   ```

2. **Create Participant Entity**
   ```java
   @Entity
   public class Participant {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @ManyToOne
       @JoinColumn(name = "group_id")
       private Group group;
       
       @ManyToOne
       @JoinColumn(name = "user_id")
       private User user;
       
       private String email; // For non-registered participants
       private String firstName;
       private String lastName;
       
       @Enumerated(EnumType.STRING)
       private ParticipantStatus status; // INVITED, ACCEPTED, DECLINED
       
       private String invitationToken;
       private LocalDateTime invitedAt;
       private LocalDateTime respondedAt;
   }
   ```

3. **Create Exclusion and Cheat Entities**
   ```java
   @Entity
   public class Exclusion {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @ManyToOne
       private Group group;
       
       @ManyToOne
       private Participant giver;
       
       @ManyToOne
       private Participant receiver;
       
       private String reason;
   }
   
   @Entity
   public class Cheat {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @ManyToOne
       private Group group;
       
       @ManyToOne
       private Participant giver;
       
       @ManyToOne
       private Participant receiver;
       
       private String reason;
   }
   ```

### Acceptance Criteria
- [ ] All entities properly mapped with relationships
- [ ] Database schema created correctly
- [ ] Foreign key constraints working
- [ ] Cascade operations configured properly

## Milestone 1.7: Repository Layer Completion

### Tasks
1. **Create Repositories**
   ```java
   public interface GroupRepository extends JpaRepository<Group, Long> {
       List<Group> findByCreatedBy(User user);
       List<Group> findByStatus(GroupStatus status);
   }
   
   public interface ParticipantRepository extends JpaRepository<Participant, Long> {
       List<Participant> findByGroup(Group group);
       Optional<Participant> findByInvitationToken(String token);
       List<Participant> findByUser(User user);
   }
   
   public interface ExclusionRepository extends JpaRepository<Exclusion, Long> {
       List<Exclusion> findByGroup(Group group);
   }
   
   public interface CheatRepository extends JpaRepository<Cheat, Long> {
       List<Cheat> findByGroup(Group group);
   }
   ```

### Acceptance Criteria
- [ ] All repositories functional with basic CRUD
- [ ] Custom query methods work correctly
- [ ] Repository tests pass
- [ ] Proper exception handling for constraint violations

## Testing Requirements

### Unit Tests
- [ ] User service registration/authentication tests
- [ ] JWT token generation/validation tests
- [ ] Password encryption/verification tests
- [ ] Repository layer tests

### Integration Tests
- [ ] Authentication controller endpoint tests
- [ ] Database integration tests
- [ ] Security configuration tests

## Database Migration Strategy

### Development
- Use H2 in-memory database for development
- Enable H2 console for debugging
- Auto-create schema from entities

### Production
- PostgreSQL database
- Create migration scripts for schema
- Environment-specific connection pools

## Security Considerations

### Password Security
- BCrypt with minimum 12 rounds
- Password complexity requirements
- Account lockout after failed attempts

### JWT Security
- RS256 algorithm for token signing
- Short-lived access tokens (15 minutes)
- Longer-lived refresh tokens (7 days)
- Token blacklisting for logout

### Data Protection
- Email addresses stored in lowercase
- Sensitive data not logged
- Proper input validation and sanitization

## Performance Considerations

### Database
- Proper indexing on frequently queried fields
- Connection pooling configuration
- Query optimization for relationships

### Authentication
- Token caching strategy
- Rate limiting for authentication endpoints
- Efficient password hashing

## Rollback Strategy

### Database
- Database migration rollback scripts
- Data backup before major changes
- Schema versioning

### Code
- Feature flags for new authentication
- Gradual rollout strategy
- Quick rollback to previous version

## Success Criteria

### Phase 1 Complete When:
- [ ] Users can register and login successfully
- [ ] JWT authentication works end-to-end
- [ ] Database entities created and functional
- [ ] All repositories working with proper relationships
- [ ] Security configuration properly protects endpoints
- [ ] Comprehensive test coverage (>80%)
- [ ] Integration tests pass
- [ ] Ready for Phase 2 group management development

### Performance Targets
- [ ] Authentication response time < 200ms
- [ ] Database query response time < 100ms
- [ ] Token validation time < 50ms

### Quality Gates
- [ ] All tests pass
- [ ] Code coverage > 80%
- [ ] No security vulnerabilities
- [ ] Proper error handling
- [ ] Documentation complete