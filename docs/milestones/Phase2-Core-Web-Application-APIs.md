# Phase 2: Core Web Application APIs

## Overview
This phase builds upon the authentication foundation to create comprehensive web application APIs for group management, participant handling, and constraint management. It extends the existing pair generation functionality to work with persisted data.

## Prerequisites
- Phase 1 completed: Authentication system and database layer (✅)
- User registration and login functional (✅)
- JWT token authentication working (✅)
- Core entities (User, Group, Participant, Exclusion, Cheat) created (✅)

## Objectives
- Create full CRUD APIs for group management
- Implement participant invitation and management system
- Build exclusion and cheat constraint management
- Integrate existing pair generation with persisted groups
- Add proper authorization and validation

## Milestone 2.1: Group Management Controller

### Tasks
1. **Create Group DTOs**
   ```java
   public record CreateGroupRequest(
       String name,
       String description,
       LocalDateTime eventDate,
       BigDecimal giftBudget
   ) {}
   
   public record UpdateGroupRequest(
       String name,
       String description,
       LocalDateTime eventDate,
       BigDecimal giftBudget,
       GroupStatus status
   ) {}
   
   public record GroupResponse(
       Long id,
       String name,
       String description,
       LocalDateTime eventDate,
       BigDecimal giftBudget,
       GroupStatus status,
       UserDto createdBy,
       LocalDateTime createdAt,
       LocalDateTime updatedAt,
       List<ParticipantDto> participants,
       int participantCount,
       int exclusionCount,
       int cheatCount
   ) {}
   
   public record GroupSummaryDto(
       Long id,
       String name,
       GroupStatus status,
       LocalDateTime eventDate,
       int participantCount,
       LocalDateTime createdAt
   ) {}
   ```

2. **Create GroupController**
   ```java
   @RestController
   @RequestMapping("/api/groups")
   @PreAuthorize("hasRole('USER')")
   public class GroupController {
       
       @GetMapping
       public Mono<ResponseEntity<List<GroupSummaryDto>>> getAllGroups(Authentication auth);
       
       @GetMapping("/{id}")
       public Mono<ResponseEntity<GroupResponse>> getGroup(@PathVariable Long id, Authentication auth);
       
       @PostMapping
       public Mono<ResponseEntity<GroupResponse>> createGroup(
           @Valid @RequestBody CreateGroupRequest request, 
           Authentication auth
       );
       
       @PutMapping("/{id}")
       public Mono<ResponseEntity<GroupResponse>> updateGroup(
           @PathVariable Long id,
           @Valid @RequestBody UpdateGroupRequest request,
           Authentication auth
       );
       
       @DeleteMapping("/{id}")
       public Mono<ResponseEntity<Void>> deleteGroup(@PathVariable Long id, Authentication auth);
       
       @GetMapping("/my-groups")
       public Mono<ResponseEntity<List<GroupSummaryDto>>> getMyGroups(Authentication auth);
       
       @GetMapping("/participating")
       public Mono<ResponseEntity<List<GroupSummaryDto>>> getGroupsParticipating(Authentication auth);
   }
   ```

3. **Create GroupService**
   ```java
   @Service
   public class GroupService {
       
       public Mono<GroupResponse> createGroup(CreateGroupRequest request, User creator);
       public Mono<GroupResponse> updateGroup(Long groupId, UpdateGroupRequest request, User user);
       public Mono<Void> deleteGroup(Long groupId, User user);
       public Mono<GroupResponse> getGroup(Long groupId, User user);
       public Flux<GroupSummaryDto> getAllGroups(User user);
       public Flux<GroupSummaryDto> getMyGroups(User user);
       public Flux<GroupSummaryDto> getGroupsParticipating(User user);
       
       // Authorization helpers
       private Mono<Boolean> isGroupOwnerOrParticipant(Long groupId, User user);
       private Mono<Boolean> isGroupOwner(Long groupId, User user);
   }
   ```

### Acceptance Criteria
- [ ] CRUD operations for groups work correctly
- [ ] Authorization ensures users can only access their groups or groups they participate in
- [ ] Group owners can modify group details
- [ ] Participants can view but not modify groups
- [ ] Proper validation for all input data
- [ ] Error handling for non-existent groups

## Milestone 2.2: Participant Management APIs

### Tasks
1. **Create Participant DTOs**
   ```java
   public record InviteParticipantRequest(
       String email,
       String firstName,
       String lastName,
       String personalMessage
   ) {}
   
   public record ParticipantDto(
       Long id,
       String email,
       String firstName,
       String lastName,
       ParticipantStatus status,
       LocalDateTime invitedAt,
       LocalDateTime respondedAt,
       boolean isRegisteredUser
   ) {}
   
   public record AcceptInvitationRequest(
       String invitationToken,
       String firstName,
       String lastName
   ) {}
   
   public record ParticipantResponse(
       ParticipantDto participant,
       GroupSummaryDto group
   ) {}
   ```

2. **Extend GroupController with Participant Management**
   ```java
   @RestController
   @RequestMapping("/api/groups/{groupId}/participants")
   public class GroupParticipantController {
       
       @GetMapping
       public Mono<ResponseEntity<List<ParticipantDto>>> getParticipants(
           @PathVariable Long groupId, 
           Authentication auth
       );
       
       @PostMapping("/invite")
       public Mono<ResponseEntity<ParticipantDto>> inviteParticipant(
           @PathVariable Long groupId,
           @Valid @RequestBody InviteParticipantRequest request,
           Authentication auth
       );
       
       @PostMapping("/bulk-invite")
       public Mono<ResponseEntity<List<ParticipantDto>>> bulkInviteParticipants(
           @PathVariable Long groupId,
           @Valid @RequestBody List<InviteParticipantRequest> requests,
           Authentication auth
       );
       
       @DeleteMapping("/{participantId}")
       public Mono<ResponseEntity<Void>> removeParticipant(
           @PathVariable Long groupId,
           @PathVariable Long participantId,
           Authentication auth
       );
       
       @PostMapping("/{participantId}/resend-invitation")
       public Mono<ResponseEntity<Void>> resendInvitation(
           @PathVariable Long groupId,
           @PathVariable Long participantId,
           Authentication auth
       );
   }
   
   @RestController
   @RequestMapping("/api/invitations")
   public class InvitationController {
       
       @GetMapping("/{token}")
       public Mono<ResponseEntity<ParticipantResponse>> getInvitation(@PathVariable String token);
       
       @PostMapping("/{token}/accept")
       public Mono<ResponseEntity<ParticipantResponse>> acceptInvitation(
           @PathVariable String token,
           @Valid @RequestBody AcceptInvitationRequest request
       );
       
       @PostMapping("/{token}/decline")
       public Mono<ResponseEntity<Void>> declineInvitation(@PathVariable String token);
   }
   ```

3. **Create ParticipantService**
   ```java
   @Service
   public class ParticipantService {
       
       public Mono<ParticipantDto> inviteParticipant(Long groupId, InviteParticipantRequest request, User inviter);
       public Flux<ParticipantDto> bulkInviteParticipants(Long groupId, List<InviteParticipantRequest> requests, User inviter);
       public Mono<Void> removeParticipant(Long groupId, Long participantId, User user);
       public Mono<Void> resendInvitation(Long groupId, Long participantId, User user);
       
       public Mono<ParticipantResponse> getInvitationDetails(String token);
       public Mono<ParticipantResponse> acceptInvitation(String token, AcceptInvitationRequest request);
       public Mono<Void> declineInvitation(String token);
       
       // Helper methods
       private String generateInvitationToken();
       private Mono<Void> sendInvitationEmail(Participant participant, User inviter);
       private Mono<User> findOrCreateUserFromEmail(String email);
   }
   ```

### Acceptance Criteria
- [ ] Group owners can invite participants via email
- [ ] Bulk invitation functionality works
- [ ] Invitation emails sent with proper templates
- [ ] Non-registered users can accept invitations
- [ ] Registered users automatically linked to their accounts
- [ ] Invitation tokens are secure and time-limited
- [ ] Participants can accept/decline invitations
- [ ] Duplicate participant email validation

## Milestone 2.3: Exclusion Management APIs

### Tasks
1. **Create Exclusion DTOs**
   ```java
   public record CreateExclusionRequest(
       Long giverParticipantId,
       Long receiverParticipantId,
       String reason
   ) {}
   
   public record ExclusionDto(
       Long id,
       ParticipantDto giver,
       ParticipantDto receiver,
       String reason,
       LocalDateTime createdAt
   ) {}
   
   public record UpdateExclusionRequest(
       String reason
   ) {}
   ```

2. **Create ExclusionController**
   ```java
   @RestController
   @RequestMapping("/api/groups/{groupId}/exclusions")
   @PreAuthorize("hasRole('USER')")
   public class ExclusionController {
       
       @GetMapping
       public Mono<ResponseEntity<List<ExclusionDto>>> getExclusions(
           @PathVariable Long groupId,
           Authentication auth
       );
       
       @PostMapping
       public Mono<ResponseEntity<ExclusionDto>> createExclusion(
           @PathVariable Long groupId,
           @Valid @RequestBody CreateExclusionRequest request,
           Authentication auth
       );
       
       @PutMapping("/{exclusionId}")
       public Mono<ResponseEntity<ExclusionDto>> updateExclusion(
           @PathVariable Long groupId,
           @PathVariable Long exclusionId,
           @Valid @RequestBody UpdateExclusionRequest request,
           Authentication auth
       );
       
       @DeleteMapping("/{exclusionId}")
       public Mono<ResponseEntity<Void>> deleteExclusion(
           @PathVariable Long groupId,
           @PathVariable Long exclusionId,
           Authentication auth
       );
   }
   ```

3. **Create ExclusionService**
   ```java
   @Service
   public class ExclusionService {
       
       public Flux<ExclusionDto> getExclusions(Long groupId, User user);
       public Mono<ExclusionDto> createExclusion(Long groupId, CreateExclusionRequest request, User user);
       public Mono<ExclusionDto> updateExclusion(Long groupId, Long exclusionId, UpdateExclusionRequest request, User user);
       public Mono<Void> deleteExclusion(Long groupId, Long exclusionId, User user);
       
       // Validation helpers
       private Mono<Void> validateExclusionRequest(Long groupId, CreateExclusionRequest request);
       private Mono<Void> checkForDuplicateExclusion(Long groupId, Long giverId, Long receiverId);
   }
   ```

### Acceptance Criteria
- [ ] Group owners can create exclusions between participants
- [ ] Duplicate exclusion validation works
- [ ] Self-exclusion prevention (can't exclude someone from themselves)
- [ ] Exclusions can be updated and deleted
- [ ] Proper authorization for exclusion management
- [ ] Exclusion reasons are optional but recommended

## Milestone 2.4: Cheat Management APIs

### Tasks
1. **Create Cheat DTOs**
   ```java
   public record CreateCheatRequest(
       Long giverParticipantId,
       Long receiverParticipantId,
       String reason
   ) {}
   
   public record CheatDto(
       Long id,
       ParticipantDto giver,
       ParticipantDto receiver,
       String reason,
       LocalDateTime createdAt
   ) {}
   
   public record UpdateCheatRequest(
       String reason
   ) {}
   ```

2. **Create CheatController**
   ```java
   @RestController
   @RequestMapping("/api/groups/{groupId}/cheats")
   @PreAuthorize("hasRole('USER')")
   public class CheatController {
       
       @GetMapping
       public Mono<ResponseEntity<List<CheatDto>>> getCheats(
           @PathVariable Long groupId,
           Authentication auth
       );
       
       @PostMapping
       public Mono<ResponseEntity<CheatDto>> createCheat(
           @PathVariable Long groupId,
           @Valid @RequestBody CreateCheatRequest request,
           Authentication auth
       );
       
       @PutMapping("/{cheatId}")
       public Mono<ResponseEntity<CheatDto>> updateCheat(
           @PathVariable Long groupId,
           @PathVariable Long cheatId,
           @Valid @RequestBody UpdateCheatRequest request,
           Authentication auth
       );
       
       @DeleteMapping("/{cheatId}")
       public Mono<ResponseEntity<Void>> deleteCheat(
           @PathVariable Long groupId,
           @PathVariable Long cheatId,
           Authentication auth
       );
   }
   ```

3. **Create CheatService**
   ```java
   @Service
   public class CheatService {
       
       public Flux<CheatDto> getCheats(Long groupId, User user);
       public Mono<CheatDto> createCheat(Long groupId, CreateCheatRequest request, User user);
       public Mono<CheatDto> updateCheat(Long groupId, Long cheatId, UpdateCheatRequest request, User user);
       public Mono<Void> deleteCheat(Long groupId, Long cheatId, User user);
       
       // Validation helpers
       private Mono<Void> validateCheatRequest(Long groupId, CreateCheatRequest request);
       private Mono<Void> checkForDuplicateCheat(Long groupId, Long giverId, Long receiverId);
       private Mono<Void> checkCheatExclusionConflict(Long groupId, Long giverId, Long receiverId);
   }
   ```

### Acceptance Criteria
- [ ] Group owners can create forced pairings (cheats)
- [ ] Duplicate cheat validation works
- [ ] Conflict detection between cheats and exclusions
- [ ] Cheats can be updated and deleted
- [ ] Proper authorization for cheat management
- [ ] Cheat reasons are optional but recommended

## Milestone 2.5: Enhanced Pair Generation Integration

### Tasks
1. **Create Assignment Entity**
   ```java
   @Entity
   public class Assignment {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @ManyToOne
       @JoinColumn(name = "group_id")
       private Group group;
       
       @ManyToOne
       @JoinColumn(name = "giver_id")
       private Participant giver;
       
       @ManyToOne
       @JoinColumn(name = "receiver_id")
       private Participant receiver;
       
       private String viewToken; // Secure token for viewing assignment
       
       @CreationTimestamp
       private LocalDateTime generatedAt;
       
       private LocalDateTime viewedAt;
       private int viewCount = 0;
   }
   ```

2. **Extend SecretSantaController for Group-based Generation**
   ```java
   @RestController
   @RequestMapping("/api/groups/{groupId}")
   public class GroupSecretSantaController {
       
       @PostMapping("/generate")
       @PreAuthorize("hasRole('USER')")
       public Mono<ResponseEntity<SecretSantaResponse>> generateAssignments(
           @PathVariable Long groupId,
           @RequestParam(defaultValue = "sync") String deliveryMode,
           Authentication auth
       );
       
       @GetMapping("/assignments")
       @PreAuthorize("hasRole('USER')")
       public Mono<ResponseEntity<List<AssignmentDto>>> getAssignments(
           @PathVariable Long groupId,
           Authentication auth
       );
       
       @PostMapping("/assignments/regenerate")
       @PreAuthorize("hasRole('USER')")
       public Mono<ResponseEntity<SecretSantaResponse>> regenerateAssignments(
           @PathVariable Long groupId,
           @RequestParam(defaultValue = "sync") String deliveryMode,
           Authentication auth
       );
   }
   
   @RestController
   @RequestMapping("/api/assignments")
   public class AssignmentController {
       
       @GetMapping("/{token}")
       public Mono<ResponseEntity<AssignmentViewDto>> viewAssignment(@PathVariable String token);
   }
   ```

3. **Create Enhanced Assignment Service**
   ```java
   @Service
   public class GroupAssignmentService {
       
       public Mono<SecretSantaResponse> generateAssignments(Long groupId, String deliveryMode, User user);
       public Mono<SecretSantaResponse> regenerateAssignments(Long groupId, String deliveryMode, User user);
       public Flux<AssignmentDto> getAssignments(Long groupId, User user);
       public Mono<AssignmentViewDto> viewAssignment(String token);
       
       // Integration with existing algorithm
       private Mono<SecretSantaRequest> buildRequestFromGroup(Group group);
       private Mono<List<Assignment>> saveAssignments(Group group, List<Pair> pairs);
       private String generateViewToken();
   }
   ```

4. **Create Assignment DTOs**
   ```java
   public record AssignmentDto(
       Long id,
       ParticipantDto giver,
       ParticipantDto receiver,
       String viewToken,
       LocalDateTime generatedAt,
       LocalDateTime viewedAt,
       int viewCount
   ) {}
   
   public record AssignmentViewDto(
       ParticipantDto giver,
       ParticipantDto receiver,
       GroupSummaryDto group,
       LocalDateTime generatedAt,
       boolean hasBeenViewed
   ) {}
   ```

### Acceptance Criteria
- [ ] Group-based pair generation works with existing algorithm
- [ ] Assignments stored in database with secure view tokens
- [ ] Group owners can view all assignments
- [ ] Participants can view only their assignment via secure token
- [ ] Assignment regeneration clears previous assignments
- [ ] Email delivery works with new group-based system
- [ ] Proper authorization for assignment operations

## Milestone 2.6: Enhanced Email Integration

### Tasks
1. **Create Email Template Service**
   ```java
   @Service
   public class EmailTemplateService {
       
       public String buildInvitationEmail(Participant participant, User inviter, Group group);
       public String buildAssignmentEmail(Assignment assignment);
       public String buildWelcomeEmail(User user);
       public String buildPasswordResetEmail(User user, String resetToken);
       
       // Template methods
       private String loadTemplate(String templateName);
       private String replaceTokens(String template, Map<String, String> tokens);
   }
   ```

2. **Extend TransactionalMailingService**
   ```java
   @Service
   public class EnhancedMailingService extends TransactionalMailingService {
       
       public Mono<EmailDeliveryResult> sendInvitationEmails(List<Participant> participants, User inviter, Group group);
       public Mono<EmailDeliveryResult> sendAssignmentEmails(List<Assignment> assignments);
       public Mono<EmailResult> sendWelcomeEmail(User user);
       public Mono<EmailResult> sendPasswordResetEmail(User user, String resetToken);
       
       // Enhanced email tracking
       public Mono<Void> markEmailAsOpened(String trackingId);
       public Mono<Void> markEmailAsClicked(String trackingId, String linkId);
   }
   ```

### Acceptance Criteria
- [ ] Invitation emails sent with proper group context
- [ ] Assignment emails include secure viewing links
- [ ] Email templates are customizable and branded
- [ ] Email tracking for opens and clicks works
- [ ] Proper error handling for email failures
- [ ] Email delivery status tracked in database

## Testing Requirements

### Unit Tests
- [ ] Group service CRUD operations
- [ ] Participant invitation and management
- [ ] Exclusion and cheat management
- [ ] Assignment generation and storage
- [ ] Email template generation
- [ ] Authorization checks

### Integration Tests
- [ ] Full group creation to assignment workflow
- [ ] Participant invitation acceptance flow
- [ ] Email delivery integration
- [ ] Database transaction rollbacks
- [ ] Security configuration tests

### API Tests
- [ ] All REST endpoints with proper authentication
- [ ] Error cases and validation
- [ ] Concurrent access scenarios
- [ ] Performance under load

## Security Considerations

### Authorization
- Group owners can manage their groups
- Participants can view but not modify groups
- Invitation tokens are time-limited and single-use
- Assignment view tokens are secure and trackable

### Data Protection
- Personal information properly validated
- Email addresses normalized and validated
- Invitation tokens encrypted
- Assignment view tracking for security audit

### API Security
- Rate limiting on invitation endpoints
- Input validation and sanitization
- SQL injection protection via JPA
- XSS protection on all user inputs

## Performance Considerations

### Database Optimization
- Proper indexing on foreign keys
- Lazy loading for entity relationships
- Query optimization for large groups
- Connection pooling for concurrent access

### Caching Strategy
- Group data caching for frequent access
- Assignment caching for viewing
- Email template caching
- User permission caching

## Success Criteria

### Phase 2 Complete When:
- [ ] Full CRUD operations for groups work correctly
- [ ] Participant invitation and management functional
- [ ] Exclusion and cheat management working
- [ ] Group-based pair generation integrated
- [ ] Enhanced email system operational
- [ ] Comprehensive authorization implemented
- [ ] All API endpoints documented and tested
- [ ] Performance targets met
- [ ] Ready for Phase 3 email and invitation enhancements

### Performance Targets
- [ ] Group creation response time < 300ms
- [ ] Participant invitation response time < 500ms
- [ ] Assignment generation for 50 participants < 2s
- [ ] Database queries optimized < 100ms average

### Quality Gates
- [ ] All tests pass with >85% coverage
- [ ] Security vulnerabilities addressed
- [ ] API documentation complete
- [ ] Error handling comprehensive
- [ ] Logging and monitoring configured