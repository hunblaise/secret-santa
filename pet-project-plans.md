# Secret Santa Web Application - Project Specification

## Project Overview

A web application for organizing Secret Santa gift exchanges. Users can create groups, set exclusions (couples can't get each other), configure forced pairings (cheats), and automatically generate and email assignments.

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **State Management**: React Query (TanStack Query)

### Backend (Already Implemented)
- Java Spring Boot with Reactor (reactive)
- REST API endpoints available

### Deployment
- Frontend: Vercel or Netlify
- Backend: Railway, Render, or cloud provider

## User Types

1. **Group Admin**: Creates and manages Secret Santa groups
2. **Participant**: Invited to join groups, receives assignments

## Core Features

### Group Management
- Create new Secret Santa groups
- Add/remove participants via email addresses
- Set exclusion rules (couples, family members, etc.)
- Configure "cheats" (forced pairings)
- Set event date and details

### Pair Generation
- Algorithm to generate valid Secret Santa assignments
- Respects exclusion rules and forced pairings
- Handles edge cases where valid assignment isn't possible

### Email Notifications
- Send invitations to participants
- Send Secret Santa assignments
- Email templates and delivery tracking

### User Management
- User registration and authentication
- Password reset functionality
- User profiles and preferences

## Application Structure

### Pages/Routes

#### Public Pages
- `/` - Landing page with product info and login
- `/login` - User authentication
- `/register` - User registration
- `/forgot-password` - Password reset
- `/privacy` - Privacy policy
- `/terms` - Terms of service

#### Authenticated Pages
- `/dashboard` - User's groups and participation overview
- `/groups/create` - Create new Secret Santa group
- `/groups/:id` - Group details and management
- `/groups/:id/edit` - Edit group settings
- `/groups/:id/results` - View generated assignments (admin only)
- `/profile` - User settings and preferences
- `/assignment/:token` - View Secret Santa assignment (from email link)

#### Error Pages
- `/404` - Page not found
- `/error` - General error page
- `/maintenance` - Maintenance mode

### User Flows

#### 1. Group Creation Flow (Admin)
1. Navigate to dashboard
2. Click "Create New Group"
3. Fill group details form:
    - Group name
    - Description
    - Event date
    - Gift budget (optional)
4. Add participants by email
5. Configure exclusions:
    - Select pairs who can't be matched
    - Add exclusion reasons
6. Configure cheats (forced pairings) - optional
7. Review all settings
8. Create group and send invitations

#### 2. Participant Invitation Flow
1. Receive email invitation
2. Click invitation link
3. Register/login if needed
4. View group details
5. Accept or decline invitation
6. Confirmation page

#### 3. Pair Generation Flow (Admin)
1. Group management page
2. Verify all participants have joined
3. Review exclusions and cheats
4. Click "Generate Secret Santa Pairs"
5. System validation
6. Generate assignments
7. Send assignment emails
8. Success confirmation with summary

#### 4. Assignment Viewing Flow (Participant)
1. Receive assignment email
2. Click secure link
3. View Secret Santa target
4. See any gift preferences/notes

### Components Architecture

#### Layout Components
- `Layout` - Main app wrapper with navigation
- `Header` - Top navigation bar
- `Footer` - Site footer
- `Sidebar` - Dashboard navigation (if needed)

#### Page Components
- `LandingPage`
- `LoginPage`
- `RegisterPage`
- `Dashboard`
- `GroupCreateForm`
- `GroupDetailPage`
- `GroupEditForm`
- `AssignmentView`
- `UserProfile`

#### Feature Components
- `ParticipantList` - Display and manage group members
- `ExclusionManager` - Set up exclusion rules
- `CheatManager` - Configure forced pairings
- `InvitationForm` - Send group invitations
- `AssignmentGenerator` - Trigger pair generation
- `EmailPreview` - Preview email templates

#### UI Components (shadcn/ui)
- `Button`, `Input`, `Label`
- `Card`, `CardHeader`, `CardContent`
- `Dialog`, `AlertDialog`
- `Form`, `FormField`, `FormMessage`
- `Table`, `TableRow`, `TableCell`
- `Alert`, `AlertDescription`
- `Badge`, `Avatar`
- `Separator`, `Tabs`

### Data Models (Frontend Types)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
  budget?: number;
  adminId: string;
  status: 'draft' | 'invitations_sent' | 'active' | 'completed';
  createdAt: string;
}

interface Participant {
  id: string;
  email: string;
  name?: string;
  status: 'invited' | 'accepted' | 'declined';
  invitedAt: string;
  respondedAt?: string;
}

interface Exclusion {
  id: string;
  participantId1: string;
  participantId2: string;
  reason?: string;
}

interface Cheat {
  id: string;
  giverId: string;
  receiverId: string;
}

interface Assignment {
  id: string;
  giverId: string;
  receiverId: string;
  groupId: string;
  generatedAt: string;
}
```

### API Integration

#### Expected Backend Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password

GET /api/groups
POST /api/groups
GET /api/groups/{id}
PUT /api/groups/{id}
DELETE /api/groups/{id}

POST /api/groups/{id}/participants
DELETE /api/groups/{id}/participants/{participantId}

POST /api/groups/{id}/exclusions
DELETE /api/groups/{id}/exclusions/{exclusionId}

POST /api/groups/{id}/cheats
DELETE /api/groups/{id}/cheats/{cheatId}

POST /api/groups/{id}/generate
GET /api/groups/{id}/assignments

GET /api/assignments/{token}
```

### Error Handling

#### Validation Rules
- Email addresses must be valid format
- Group names required, max 100 characters
- Event date must be in the future
- Exclusions can't create impossible assignments
- Participants can't exclude themselves

#### Error States
- Network connectivity issues
- Invalid form submissions
- Assignment generation failures
- Email delivery problems
- Authentication timeouts

### Security Considerations
- JWT token management
- Secure assignment viewing (token-based links)
- Input validation and sanitization
- Rate limiting on sensitive operations
- HTTPS enforcement

### Performance Requirements
- Fast page loads (< 2 seconds)
- Responsive design for mobile devices
- Efficient assignment generation algorithm
- Optimistic UI updates where appropriate

### Future Enhancements (Not MVP)
- Gift wishlist management
- Group chat/messaging
- Photo sharing
- Recurring annual groups
- Group templates
- Advanced reporting
- Mobile app

## Development Priorities

### Phase 1 (MVP)
1. User authentication system
2. Basic group creation and management
3. Participant invitation system
4. Simple pair generation (no exclusions/cheats)
5. Email notifications
6. Assignment viewing

### Phase 2
1. Exclusion rules
2. Cheat configurations
3. Advanced group management
4. Better error handling
5. Responsive design improvements

### Phase 3
1. User experience polish
2. Performance optimizations
3. Additional features based on feedback

## Getting Started

1. Set up React + TypeScript + Vite project
2. Configure Tailwind CSS and shadcn/ui
3. Set up routing with React Router
4. Implement basic authentication
5. Create dashboard and group creation flows
6. Integrate with existing backend API
7. Implement email functionality
8. Add error handling and validation
9. Deploy and test

## Notes for Implementation

- Focus on user experience - the app should be intuitive for non-technical users
- Handle edge cases gracefully (impossible assignments, email failures)
- Ensure mobile responsiveness - many users will access via mobile
- Keep the UI clean and professional - this could be used in corporate settings
- Plan for scalability - the backend is reactive, frontend should be efficient too