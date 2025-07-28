# Phase 3: Email & Invitation System

## Overview
This phase enhances the email system and creates a comprehensive invitation workflow. It builds upon the existing robust email infrastructure to support participant invitations, assignment notifications, and secure assignment viewing.

## Prerequisites
- Phase 1 completed: Authentication and database foundation (✅)
- Phase 2 completed: Core web application APIs (✅)
- Group and participant management functional (✅)
- Basic email system from original implementation (✅)

## Objectives
- Create comprehensive invitation email templates
- Implement secure assignment viewing system
- Add email tracking and audit capabilities
- Enhance existing email system with new workflows
- Create responsive email templates

## Milestone 3.1: Enhanced Email Template System

### Tasks
1. **Create Email Template Infrastructure**
   ```java
   public enum EmailTemplateType {
       INVITATION,
       ASSIGNMENT,
       WELCOME,
       PASSWORD_RESET,
       ASSIGNMENT_REMINDER,
       GROUP_UPDATE
   }
   
   @Entity
   public class EmailTemplate {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @Enumerated(EnumType.STRING)
       private EmailTemplateType type;
       
       private String subject;
       
       @Lob
       private String htmlContent;
       
       @Lob
       private String textContent;
       
       private String locale = "en";
       
       private boolean isActive = true;
       
       @CreationTimestamp
       private LocalDateTime createdAt;
       
       @UpdateTimestamp
       private LocalDateTime updatedAt;
   }
   ```

2. **Create EmailTemplateService**
   ```java
   @Service
   public class EmailTemplateService {
       
       public Mono<String> renderInvitationEmail(Participant participant, User inviter, Group group);
       public Mono<String> renderAssignmentEmail(Assignment assignment);
       public Mono<String> renderWelcomeEmail(User user);
       public Mono<String> renderPasswordResetEmail(User user, String resetToken);
       public Mono<String> renderAssignmentReminderEmail(Assignment assignment);
       public Mono<String> renderGroupUpdateEmail(Group group, User user, String updateType);
       
       // Template management
       public Mono<EmailTemplate> createTemplate(EmailTemplateType type, String subject, String htmlContent, String textContent);
       public Mono<EmailTemplate> updateTemplate(Long templateId, String subject, String htmlContent, String textContent);
       public Flux<EmailTemplate> getAllTemplates();
       public Mono<EmailTemplate> getActiveTemplate(EmailTemplateType type, String locale);
       
       // Template rendering
       private String replaceTokens(String template, Map<String, Object> tokens);
       private Map<String, Object> buildInvitationTokens(Participant participant, User inviter, Group group);
       private Map<String, Object> buildAssignmentTokens(Assignment assignment);
   }
   ```

3. **Create HTML Email Templates**
   ```html
   <!-- invitation-template.html -->
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Secret Santa Invitation</title>
       <style>
           /* Responsive email styles */
           @media screen and (max-width: 600px) {
               .container { width: 100% !important; }
               .content { padding: 20px !important; }
           }
           
           .container {
               max-width: 600px;
               margin: 0 auto;
               background-color: #ffffff;
               font-family: Arial, sans-serif;
           }
           
           .header {
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               color: white;
               padding: 30px 20px;
               text-align: center;
           }
           
           .content {
               padding: 40px 30px;
               line-height: 1.6;
           }
           
           .button {
               display: inline-block;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               color: white;
               padding: 15px 30px;
               text-decoration: none;
               border-radius: 5px;
               margin: 20px 0;
           }
           
           .footer {
               background-color: #f8f9fa;
               padding: 20px;
               text-align: center;
               font-size: 14px;
               color: #666;
           }
       </style>
   </head>
   <body>
       <div class="container">
           <div class="header">
               <h1>🎁 Secret Santa Invitation</h1>
           </div>
           
           <div class="content">
               <h2>Hello {{participantName}}!</h2>
               
               <p>{{inviterName}} has invited you to join the Secret Santa group "<strong>{{groupName}}</strong>".</p>
               
               <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                   <h3>Event Details:</h3>
                   <ul style="list-style: none; padding: 0;">
                       <li><strong>Group:</strong> {{groupName}}</li>
                       <li><strong>Event Date:</strong> {{eventDate}}</li>
                       <li><strong>Gift Budget:</strong> {{giftBudget}}</li>
                       <li><strong>Participants:</strong> {{participantCount}} people</li>
                   </ul>
               </div>
               
               {{#groupDescription}}
               <p><strong>Description:</strong> {{groupDescription}}</p>
               {{/groupDescription}}
               
               {{#personalMessage}}
               <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
                   <p><strong>Personal message from {{inviterName}}:</strong></p>
                   <p style="font-style: italic;">"{{personalMessage}}"</p>
               </div>
               {{/personalMessage}}
               
               <p>Click the button below to accept or decline this invitation:</p>
               
               <div style="text-align: center;">
                   <a href="{{invitationUrl}}" class="button">View Invitation</a>
               </div>
               
               <p style="margin-top: 30px; font-size: 14px; color: #666;">
                   This invitation will expire on {{expirationDate}}. 
                   If you have any questions, you can reply to this email or contact {{inviterEmail}}.
               </p>
           </div>
           
           <div class="footer">
               <p>Secret Santa Generator | Making gift exchanges magical since 2024</p>
               <p>This is an automated email. Please do not reply directly to this address.</p>
           </div>
       </div>
   </body>
   </html>
   ```

### Acceptance Criteria
- [ ] Email templates support HTML and text versions
- [ ] Templates are responsive for mobile devices
- [ ] Token replacement system works correctly
- [ ] Templates support internationalization
- [ ] Template management API functional
- [ ] Fallback to default templates if custom ones fail

## Milestone 3.2: Advanced Assignment Viewing System

### Tasks
1. **Create Assignment Viewing Infrastructure**
   ```java
   @Entity
   public class AssignmentView {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @ManyToOne
       @JoinColumn(name = "assignment_id")
       private Assignment assignment;
       
       private String ipAddress;
       private String userAgent;
       private String location; // Optional: derived from IP
       
       @CreationTimestamp
       private LocalDateTime viewedAt;
       
       private boolean isFirstView = false;
   }
   
   @Entity
   public class AssignmentToken {
       @Id
       private String token;
       
       @ManyToOne
       @JoinColumn(name = "assignment_id")
       private Assignment assignment;
       
       private LocalDateTime expiresAt;
       private boolean isUsed = false;
       private int maxUses = 10; // Allow multiple views
       private int useCount = 0;
       
       @CreationTimestamp
       private LocalDateTime createdAt;
   }
   ```

2. **Create Enhanced Assignment Controller**
   ```java
   @RestController
   @RequestMapping("/api/assignments")
   public class AssignmentViewController {
       
       @GetMapping("/{token}")
       public Mono<ResponseEntity<AssignmentViewDto>> viewAssignment(
           @PathVariable String token,
           HttpServletRequest request
       );
       
       @PostMapping("/{token}/mark-viewed")
       public Mono<ResponseEntity<Void>> markAsViewed(
           @PathVariable String token,
           HttpServletRequest request
       );
       
       @GetMapping("/{token}/download-info")
       public Mono<ResponseEntity<byte[]>> downloadAssignmentInfo(
           @PathVariable String token,
           @RequestParam(defaultValue = "pdf") String format
       );
   }
   ```

3. **Create Assignment View Service**
   ```java
   @Service
   public class AssignmentViewService {
       
       public Mono<AssignmentViewDto> viewAssignment(String token, String ipAddress, String userAgent);
       public Mono<Void> recordView(Assignment assignment, String ipAddress, String userAgent);
       public Mono<String> generateViewToken(Assignment assignment);
       public Mono<Boolean> isTokenValid(String token);
       public Mono<AssignmentStats> getAssignmentStats(Long assignmentId);
       
       // Security and tracking
       private Mono<String> getLocationFromIP(String ipAddress);
       private boolean isFirstTimeView(Assignment assignment, String ipAddress);
       private Mono<Void> sendViewNotificationToAdmin(Assignment assignment, AssignmentView view);
   }
   ```

4. **Create Assignment Viewing DTOs**
   ```java
   public record AssignmentViewDto(
       String giverName,
       String receiverName,
       String receiverEmail,
       GroupInfoDto group,
       LocalDateTime eventDate,
       BigDecimal giftBudget,
       String specialInstructions,
       boolean hasBeenViewed,
       LocalDateTime firstViewedAt,
       int totalViews
   ) {}
   
   public record GroupInfoDto(
       String name,
       String description,
       LocalDateTime eventDate,
       BigDecimal giftBudget,
       String organizerName,
       String organizerEmail
   ) {}
   
   public record AssignmentStats(
       Long assignmentId,
       int totalViews,
       LocalDateTime firstViewedAt,
       LocalDateTime lastViewedAt,
       List<AssignmentViewSummary> recentViews
   ) {}
   
   public record AssignmentViewSummary(
       LocalDateTime viewedAt,
       String location,
       boolean isFirstView
   ) {}
   ```

### Acceptance Criteria
- [ ] Assignment tokens are cryptographically secure
- [ ] View tracking works without requiring login
- [ ] IP address and user agent logging for security
- [ ] Token expiration and usage limits enforced
- [ ] Assignment information downloadable as PDF
- [ ] Admin notifications for suspicious viewing patterns

## Milestone 3.3: Comprehensive Invitation Workflow

### Tasks
1. **Create Invitation Management Service**
   ```java
   @Service
   public class InvitationWorkflowService {
       
       public Mono<List<InvitationResult>> sendGroupInvitations(
           Long groupId, 
           List<InviteParticipantRequest> requests, 
           User inviter
       );
       
       public Mono<InvitationResult> resendInvitation(Long participantId, User inviter);
       public Mono<InvitationStats> getInvitationStats(Long groupId);
       public Mono<Void> cancelInvitation(Long participantId, User inviter);
       public Mono<Void> sendInvitationReminder(Long participantId, User inviter);
       
       // Bulk operations
       public Mono<List<InvitationResult>> sendBulkReminders(Long groupId, User inviter);
       public Mono<Void> cancelAllPendingInvitations(Long groupId, User inviter);
       
       // Analytics
       public Mono<InvitationAnalytics> getInvitationAnalytics(Long groupId);
   }
   ```

2. **Create Invitation DTOs**
   ```java
   public record InvitationResult(
       Long participantId,
       String email,
       InvitationStatus status,
       String errorMessage,
       LocalDateTime sentAt
   ) {}
   
   public enum InvitationStatus {
       SENT,
       FAILED,
       ALREADY_SENT,
       INVALID_EMAIL,
       USER_ALREADY_IN_GROUP
   }
   
   public record InvitationStats(
       int totalInvitations,
       int pendingInvitations,
       int acceptedInvitations,
       int declinedInvitations,
       int expiredInvitations,
       double acceptanceRate,
       LocalDateTime lastInvitationSent
   ) {}
   
   public record InvitationAnalytics(
       InvitationStats stats,
       List<InvitationTimelineEntry> timeline,
       Map<String, Integer> responseTimeDistribution
   ) {}
   
   public record InvitationTimelineEntry(
       LocalDateTime timestamp,
       String participantEmail,
       String action, // INVITED, ACCEPTED, DECLINED, REMINDED
       String details
   ) {}
   ```

3. **Create Invitation Controller Extensions**
   ```java
   @RestController
   @RequestMapping("/api/groups/{groupId}/invitations")
   public class InvitationManagementController {
       
       @GetMapping("/stats")
       public Mono<ResponseEntity<InvitationStats>> getInvitationStats(
           @PathVariable Long groupId,
           Authentication auth
       );
       
       @PostMapping("/bulk-send")
       public Mono<ResponseEntity<List<InvitationResult>>> sendBulkInvitations(
           @PathVariable Long groupId,
           @RequestBody List<InviteParticipantRequest> requests,
           Authentication auth
       );
       
       @PostMapping("/bulk-remind")
       public Mono<ResponseEntity<List<InvitationResult>>> sendBulkReminders(
           @PathVariable Long groupId,
           Authentication auth
       );
       
       @PostMapping("/{participantId}/remind")
       public Mono<ResponseEntity<Void>> sendReminder(
           @PathVariable Long groupId,
           @PathVariable Long participantId,
           Authentication auth
       );
       
       @DeleteMapping("/{participantId}")
       public Mono<ResponseEntity<Void>> cancelInvitation(
           @PathVariable Long groupId,
           @PathVariable Long participantId,
           Authentication auth
       );
       
       @GetMapping("/analytics")
       public Mono<ResponseEntity<InvitationAnalytics>> getAnalytics(
           @PathVariable Long groupId,
           Authentication auth
       );
   }
   ```

### Acceptance Criteria
- [ ] Bulk invitation sending with individual result tracking
- [ ] Invitation reminder system functional
- [ ] Invitation cancellation works properly
- [ ] Analytics provide useful insights
- [ ] Error handling for invalid email addresses
- [ ] Rate limiting for invitation sending

## Milestone 3.4: Email Tracking and Audit System

### Tasks
1. **Create Email Tracking Infrastructure**
   ```java
   @Entity
   public class EmailDeliveryLog {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       private String trackingId;
       
       @Enumerated(EnumType.STRING)
       private EmailTemplateType emailType;
       
       private String recipientEmail;
       private String subject;
       
       @Enumerated(EnumType.STRING)
       private EmailDeliveryStatus status;
       
       private LocalDateTime sentAt;
       private LocalDateTime deliveredAt;
       private LocalDateTime openedAt;
       private LocalDateTime firstClickAt;
       
       private int openCount = 0;
       private int clickCount = 0;
       
       private String failureReason;
       
       // Relationships
       @ManyToOne
       private User recipient;
       
       @ManyToOne
       private Group relatedGroup;
       
       @ManyToOne
       private Assignment relatedAssignment;
   }
   
   @Entity
   public class EmailInteraction {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @ManyToOne
       @JoinColumn(name = "email_log_id")
       private EmailDeliveryLog emailLog;
       
       @Enumerated(EnumType.STRING)
       private EmailInteractionType type; // OPEN, CLICK, FORWARD, REPLY
       
       private String userAgent;
       private String ipAddress;
       private String clickedUrl;
       
       @CreationTimestamp
       private LocalDateTime timestamp;
   }
   ```

2. **Create Email Tracking Service**
   ```java
   @Service
   public class EmailTrackingService {
       
       public Mono<String> createTrackingId();
       public Mono<Void> logEmailSent(String trackingId, EmailTemplateType type, String recipient, String subject);
       public Mono<Void> logEmailDelivered(String trackingId);
       public Mono<Void> logEmailOpened(String trackingId, String userAgent, String ipAddress);
       public Mono<Void> logEmailClicked(String trackingId, String clickedUrl, String userAgent, String ipAddress);
       public Mono<Void> logEmailFailed(String trackingId, String failureReason);
       
       public Mono<EmailTrackingStats> getEmailStats(Long groupId);
       public Mono<List<EmailDeliveryLog>> getEmailHistory(Long groupId);
       public Mono<EmailDeliveryLog> getEmailDetails(String trackingId);
       
       // Analytics
       public Mono<EmailEngagementReport> generateEngagementReport(Long groupId, LocalDateTime from, LocalDateTime to);
   }
   ```

3. **Create Email Tracking Controller**
   ```java
   @RestController
   @RequestMapping("/api/email-tracking")
   public class EmailTrackingController {
       
       // Pixel tracking for email opens
       @GetMapping("/pixel/{trackingId}")
       public Mono<ResponseEntity<byte[]>> trackEmailOpen(
           @PathVariable String trackingId,
           HttpServletRequest request
       );
       
       // Link tracking for email clicks
       @GetMapping("/link/{trackingId}")
       public Mono<ResponseEntity<Void>> trackEmailClick(
           @PathVariable String trackingId,
           @RequestParam String url,
           HttpServletRequest request
       );
       
       // Analytics endpoints
       @GetMapping("/stats/{groupId}")
       @PreAuthorize("hasRole('USER')")
       public Mono<ResponseEntity<EmailTrackingStats>> getEmailStats(
           @PathVariable Long groupId,
           Authentication auth
       );
       
       @GetMapping("/history/{groupId}")
       @PreAuthorize("hasRole('USER')")
       public Mono<ResponseEntity<List<EmailDeliveryLog>>> getEmailHistory(
           @PathVariable Long groupId,
           Authentication auth
       );
   }
   ```

### Acceptance Criteria
- [ ] Email open tracking with invisible pixels
- [ ] Link click tracking with redirect
- [ ] Comprehensive email delivery logging
- [ ] Email engagement analytics
- [ ] Privacy-compliant tracking (GDPR considerations)
- [ ] Performance optimized for high volume

## Milestone 3.5: Assignment Email Enhancement

### Tasks
1. **Create Enhanced Assignment Email Templates**
   ```html
   <!-- assignment-template.html -->
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Your Secret Santa Assignment</title>
       <!-- Same responsive styles as invitation template -->
   </head>
   <body>
       <div class="container">
           <div class="header">
               <h1>🎁 Your Secret Santa Assignment!</h1>
           </div>
           
           <div class="content">
               <h2>Hello {{giverName}}!</h2>
               
               <p>The Secret Santa assignments for "<strong>{{groupName}}</strong>" have been generated!</p>
               
               <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center;">
                   <h2 style="margin: 0 0 15px 0;">🎯 Your Secret Santa Assignment</h2>
                   <p style="font-size: 18px; margin: 0;">You are giving a gift to:</p>
                   <h3 style="font-size: 24px; margin: 10px 0 0 0;">{{receiverName}}</h3>
               </div>
               
               <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                   <h3>Event Details:</h3>
                   <ul style="list-style: none; padding: 0;">
                       <li><strong>Event Date:</strong> {{eventDate}}</li>
                       <li><strong>Gift Budget:</strong> {{giftBudget}}</li>
                       <li><strong>Organizer:</strong> {{organizerName}} ({{organizerEmail}})</li>
                   </ul>
               </div>
               
               {{#specialInstructions}}
               <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                   <h4>Special Instructions:</h4>
                   <p>{{specialInstructions}}</p>
               </div>
               {{/specialInstructions}}
               
               <div style="text-align: center; margin: 30px 0;">
                   <a href="{{assignmentUrl}}" class="button">View Full Assignment Details</a>
               </div>
               
               <div style="background-color: #d1ecf1; padding: 15px; border: 1px solid #bee5eb; border-radius: 5px; margin: 20px 0;">
                   <h4>🔒 Keep It Secret!</h4>
                   <p>Remember, this is a <strong>Secret</strong> Santa! Don't reveal who you're giving a gift to. The magic is in the surprise! 🎭</p>
               </div>
               
               <p style="margin-top: 30px; font-size: 14px; color: #666;">
                   You can view your assignment details anytime using the link above. 
                   If you have any questions about the gift exchange, contact {{organizerEmail}}.
               </p>
           </div>
           
           <div class="footer">
               <p>Secret Santa Generator | Making gift exchanges magical since 2024</p>
               <p><a href="{{trackingPixelUrl}}"><!--tracking pixel--></a></p>
           </div>
       </div>
   </body>
   </html>
   ```

2. **Create Assignment Email Service**
   ```java
   @Service
   public class AssignmentEmailService {
       
       public Mono<EmailDeliveryResult> sendAssignmentEmails(List<Assignment> assignments);
       public Mono<EmailResult> sendIndividualAssignmentEmail(Assignment assignment);
       public Mono<EmailDeliveryResult> sendAssignmentReminders(Long groupId);
       
       // Enhanced email features
       private String generateSecureAssignmentUrl(Assignment assignment);
       private Map<String, Object> buildAssignmentEmailTokens(Assignment assignment);
       private String addTrackingPixel(String htmlContent, String trackingId);
       private String addClickTracking(String htmlContent, String trackingId);
   }
   ```

### Acceptance Criteria
- [ ] Assignment emails include secure viewing links
- [ ] Email templates are visually appealing and mobile-friendly
- [ ] Tracking pixels embedded for open tracking
- [ ] Click tracking on assignment view links
- [ ] Assignment reminder functionality
- [ ] Proper error handling for email failures

## Testing Requirements

### Unit Tests
- [ ] Email template rendering with various scenarios
- [ ] Assignment token generation and validation
- [ ] Email tracking functionality
- [ ] Invitation workflow state management

### Integration Tests
- [ ] End-to-end invitation workflow
- [ ] Assignment email delivery and viewing
- [ ] Email tracking pixel and click tracking
- [ ] Bulk invitation operations

### Email Tests
- [ ] Template rendering in various email clients
- [ ] Mobile responsiveness testing
- [ ] Spam filter compliance testing
- [ ] Deliverability testing

## Security Considerations

### Email Security
- SPF, DKIM, and DMARC configuration
- Email content sanitization
- Tracking pixel privacy compliance
- Secure token generation for assignments

### Privacy Protection
- GDPR compliance for email tracking
- Option to disable tracking per user
- Data retention policies for email logs
- Anonymization of tracking data

### Assignment Security
- Cryptographically secure tokens
- Token expiration and rotation
- View count limitations
- IP address monitoring for suspicious activity

## Performance Considerations

### Email Delivery
- Queue-based email sending for bulk operations
- Rate limiting to prevent spam flags
- Retry logic for failed deliveries
- Connection pooling for SMTP

### Tracking Performance
- Optimized pixel serving
- Cached redirect handling
- Efficient database queries for analytics
- Background processing for tracking data

## Success Criteria

### Phase 3 Complete When:
- [ ] Invitation emails sent with professional templates
- [ ] Assignment viewing system secure and functional
- [ ] Email tracking provides actionable insights
- [ ] Bulk invitation operations work efficiently
- [ ] Assignment emails enhance user experience
- [ ] Email analytics dashboard functional
- [ ] Performance targets met for email operations
- [ ] Ready for Phase 4 frontend integration preparation

### Performance Targets
- [ ] Email delivery time < 30 seconds for 50 recipients
- [ ] Tracking pixel response time < 100ms
- [ ] Assignment view page load time < 2 seconds
- [ ] Email template rendering time < 500ms

### Quality Gates
- [ ] All tests pass with >85% coverage
- [ ] Email templates render correctly across major clients
- [ ] Security vulnerabilities addressed
- [ ] Privacy compliance verified
- [ ] Deliverability rates > 95%