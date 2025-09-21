# Product Requirements Document (PRD)
# Secret Santa Generator Application

**Version:** 2.0  
**Status:** Design Update  
**Last Updated:** September 2025  
**Author:** Engineering & Design Team

---

## Executive Summary

The Secret Santa Generator is a web application that automates the creation and distribution of Secret Santa gift exchange assignments. The MVP will provide a modern, accessible interface built with Next.js and ShadCN/UI components, connecting to an existing Java backend service. The application solves the common problem of organizing gift exchanges by handling random pair generation with advanced constraints and optional automated email delivery.

**Problem:** Organizing Secret Santa exchanges manually is time-consuming, error-prone, and lacks privacy when one person knows all assignments.

**Solution:** A web application that automatically generates random pairings with support for exclusions, forced pairings, and automated email distribution.

**Target Timeline:** 75-minute MVP implementation

---

## Background and Context

### Market Research
Secret Santa gift exchanges are a widespread tradition in workplaces, families, and social groups. Current solutions often involve manual drawing of names, basic randomizers without constraint support, or complex spreadsheets that require technical knowledge.

### Competitive Analysis

After analyzing leading Secret Santa applications (DrawNames, Elfster, Secret Santa Generator), key patterns emerged:

**Common Strengths:**
- Simple, linear flows
- Clear CTAs
- Email-based distribution
- Mobile-responsive designs

**Common Weaknesses:**
- Cluttered interfaces with ads
- Complex multi-step processes requiring registration
- Limited constraint options
- Poor error handling
- Lack of visual feedback

**Our Differentiation:**
- No registration required
- Single-page application for speed
- Advanced constraints without complexity
- Real-time validation and feedback
- Clean, ad-free interface

### Current State
Currently, users must either:
- Manually organize draws (lacks privacy, prone to errors)
- Use basic online tools (limited features, no exclusion support)
- Create custom solutions (time-consuming, technical barrier)

### Strategic Alignment
This project serves as a demonstration of rapid MVP development using modern web technologies while providing genuine value to users during gift-giving seasons.

---

## Users and Use Cases

### Primary Personas

**Office Organizer - Sarah**
- Role: HR Manager organizing company Secret Santa
- Needs: Ensure couples don't get each other, handle remote employees
- Pain Points: Maintaining anonymity, tracking who received emails
- Technical Skill: Low to moderate
- Device: Desktop primarily, tablet for reviewing

**Family Coordinator - Michael**
- Role: Family member organizing annual gift exchange
- Needs: Prevent spouses from getting each other, include extended family
- Pain Points: Dealing with family dynamics, ensuring fairness
- Technical Skill: Moderate
- Device: Mobile and desktop equally

**Friend Group Planner - Alex**
- Role: Social group organizer
- Needs: Quick setup, easy sharing of results
- Pain Points: Getting everyone's email, handling last-minute changes
- Technical Skill: High
- Device: Mobile-first, desktop for complex setups

### User Stories

1. **As an organizer**, I want to enter participant emails quickly, so that I can set up the exchange in minutes.

2. **As an organizer**, I want to prevent specific pairings, so that couples or family members don't get each other.

3. **As an organizer**, I want to force certain pairings, so that I can ensure specific gift exchanges happen.

4. **As an organizer**, I want to use display names instead of emails, so that results are more personal.

5. **As a participant**, I want to receive my assignment via email, so that only I know who I'm buying for.

6. **As an organizer**, I want to see the status of email delivery, so that I know who received their assignments.

---

## Design Philosophy & Principles

### Core Design Principles

1. **Progressive Disclosure:** Show basic features upfront, advanced options on demand
2. **Immediate Feedback:** Real-time validation and visual responses
3. **Festive but Professional:** Holiday spirit without sacrificing usability
4. **Mobile-First Responsive:** Designed for phones, scaled for desktops
5. **Accessibility First:** WCAG 2.1 AA compliance as baseline

### Visual Design System

#### Color Palette
```
Primary Colors:
- Christmas Red: #DC2626 (Primary actions, success states)
- Forest Green: #059669 (Secondary actions, confirmations)
- Snow White: #FFFFFF (Backgrounds, cards)
- Midnight Blue: #1E293B (Text, headers)

Accent Colors:
- Gold Star: #FCD34D (Highlights, badges)
- Ice Blue: #E0F2FE (Info states, backgrounds)
- Warm Gray: #F3F4F6 (Disabled states, borders)

Semantic Colors:
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Info: #3B82F6
```

#### Typography
```
Font Family: Inter (Primary), System Fonts (Fallback)

Headers:
- H1: 48px/56px, Bold (Landing hero)
- H2: 36px/44px, Semibold (Section headers)
- H3: 24px/32px, Semibold (Card titles)
- H4: 18px/28px, Medium (Subsections)

Body:
- Large: 18px/28px, Regular (Introductions)
- Base: 16px/24px, Regular (Body text)
- Small: 14px/20px, Regular (Help text)
- Tiny: 12px/16px, Regular (Captions)
```

#### Spacing System
```
Base unit: 4px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
```

---

## Detailed UI/UX Design

### 1. Landing Page Design

#### Hero Section
```
Layout: Center-aligned, full viewport height
Background: Subtle gradient (White to Ice Blue)
Animation: Falling snowflakes (CSS, performant)

Components:
┌─────────────────────────────────────┐
│          [Animated Gift Icon]       │
│                                     │
│    Secret Santa Generator           │
│    ─────────────────────           │
│  Create magical gift exchanges      │
│  with advanced pairing options     │
│                                     │
│    [Start Creating] (Primary CTA)   │
│                                     │
│  ✓ No registration  ✓ Free forever │
│  ✓ Email delivery   ✓ 100% private │
└─────────────────────────────────────┘
```

**Design Decisions:**
- Animated gift box icon with subtle bounce effect draws attention
- Clear value proposition in 10 words or less
- Single prominent CTA reduces decision fatigue
- Trust indicators address privacy concerns immediately

#### Main Application Area

**Desktop Layout (1280px+)**
```
┌───────────────────────────────────────────────────────┐
│                    Header Bar                          │
│  🎁 Secret Santa        Steps: ○──○──○    [Help] [?]  │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┬──────────────────────────┐  │
│  │                     │                          │  │
│  │   Main Form         │   Live Preview           │  │
│  │   (60% width)       │   (40% width)            │  │
│  │                     │                          │  │
│  │  ┌───────────────┐  │  Participants: 0         │  │
│  │  │               │  │                          │  │
│  │  │  Email Input  │  │  ┌──────────────────┐   │  │
│  │  │   Textarea    │  │  │                  │   │  │
│  │  │               │  │  │  Empty State     │   │  │
│  │  └───────────────┘  │  │  Illustration    │   │  │
│  │                     │  │                  │   │  │
│  │  [Advanced ▼]      │  └──────────────────┘   │  │
│  │                     │                          │  │
│  │  ┌───────────────┐  │  Ready when you are!    │  │
│  │  │ Generate Pairs│  │                          │  │
│  │  └───────────────┘  │                          │  │
│  └─────────────────────┴──────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

**Mobile Layout (< 768px)**
```
┌─────────────────────┐
│   🎁 Secret Santa   │
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │  Email Input  │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  Participants: 0    │
│                     │
│  [Advanced ▼]      │
│                     │
│  ┌───────────────┐  │
│  │Generate Pairs │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

### 2. Email Input Component

**Interactive States:**

```
Empty State:
┌──────────────────────────────────────┐
│ Add Participants                     │
│ ┌──────────────────────────────────┐ │
│ │ john@example.com                 │ │
│ │ jane@example.com                 │ │
│ │ bob@example.com                  │ │
│ │ |                                │ │
│ └──────────────────────────────────┘ │
│ One email per line • Min 3 required  │
└──────────────────────────────────────┘

Typing State (with validation):
┌──────────────────────────────────────┐
│ Add Participants              [3] ✓  │
│ ┌──────────────────────────────────┐ │
│ │ john@example.com ✓               │ │
│ │ jane@example.com ✓               │ │
│ │ invalid-email ✗                  │ │
│ │ bob@example.com ✓                │ │
│ │ typing...|                       │ │
│ └──────────────────────────────────┘ │
│ ⚠️ Line 3: Invalid email format      │
└──────────────────────────────────────┘
```

**Design Features:**
- Real-time validation with inline checkmarks/crosses
- Line numbers for easy error identification
- Participant count badge updates live
- Smooth height animation as content grows
- Paste support for bulk entry

### 3. Advanced Options Interface

**Collapsed State:**
```
┌──────────────────────────────────────┐
│ ▶ Advanced Options                   │
│   Set exclusions, pairings & names   │
└──────────────────────────────────────┘
```

**Expanded State:**
```
┌──────────────────────────────────────┐
│ ▼ Advanced Options                   │
├──────────────────────────────────────┤
│ [Exclusions] [Forced] [Names]        │
├──────────────────────────────────────┤
│                                      │
│  Exclusions Tab:                    │
│  ┌──────────────────────────────┐   │
│  │ John  [cannot give to] ▼ Jane│   │
│  │                      [Remove] │   │
│  └──────────────────────────────┘   │
│                                      │
│  [+ Add Exclusion Rule]             │
│                                      │
└──────────────────────────────────────┘
```

**Interaction Patterns:**
- Tabs with icons for visual recognition
- Dropdown selects populated from entered emails
- Visual relationship indicators (arrows, connecting lines)
- Inline delete with confirmation
- Smart defaults (auto-detect couples by last name)

### 4. Generation Process & Loading States

**Loading Animation Sequence:**
```
Step 1: Validating Participants...
[████░░░░░░░░░░░░░░░░] 20%

Step 2: Applying Constraints...
[████████░░░░░░░░░░░░] 40%

Step 3: Generating Pairs...
[████████████░░░░░░░░] 60%

Step 4: Sending Emails...
[████████████████░░░░] 80%

Step 5: Finalizing...
[████████████████████] 100%
```

**Design Elements:**
- Multi-step progress indicator
- Animated gift box that shakes during processing
- Humorous loading messages ("Checking who's naughty or nice...")
- Estimated time remaining
- Cancel button for long operations

### 5. Results Display

**Success State:**
```
┌──────────────────────────────────────────┐
│            ✨ Success! ✨                │
│                                          │
│         Generated 10 pairs               │
│     All emails sent successfully        │
├──────────────────────────────────────────┤
│                                          │
│  Secret Santa Assignments:              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 1. John → Jane         ✉️ Sent     │ │
│  │ 2. Jane → Bob          ✉️ Sent     │ │
│  │ 3. Bob → Sarah         ✉️ Sent     │ │
│  │ ...                                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Copy All] [Download] [Start Over]     │
│                                          │
└──────────────────────────────────────────┘
```

**Features:**
- Confetti animation on success
- Color-coded email status indicators
- Expandable details for each pairing
- One-click actions for common tasks
- Share link generation for results

### 6. Error Handling & Edge Cases

**No Solution Possible:**
```
┌──────────────────────────────────────────┐
│         ⚠️ Cannot Generate Pairs         │
│                                          │
│  Your constraints make it impossible    │
│  to create valid pairings.             │
│                                          │
│  Common issues:                        │
│  • Too many exclusions                 │
│  • Conflicting forced pairings        │
│  • Circular dependencies               │
│                                          │
│  [View Conflicts] [Adjust Rules]       │
└──────────────────────────────────────────┘
```

**Partial Email Failure:**
```
┌──────────────────────────────────────────┐
│      ⚠️ Some Emails Failed to Send       │
│                                          │
│  3 of 10 emails couldn't be delivered   │
│                                          │
│  Failed recipients:                     │
│  • john@example.com - Invalid address   │
│  • jane@example.com - Mailbox full     │
│  • bob@example.com - Server timeout    │
│                                          │
│  [Retry Failed] [Copy Manual List]     │
└──────────────────────────────────────────┘
```

### 7. Mobile-Specific Optimizations

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Extra padding on form inputs (16px)
- Sticky CTA button at bottom of viewport
- Swipe gestures for tab navigation

**Responsive Behaviors:**
- Stack preview panel below form on mobile
- Full-screen modal for advanced options
- Collapsible sections to reduce scrolling
- Native email keyboard for email inputs

### 8. Accessibility Features

**Screen Reader Support:**
- Semantic HTML structure
- ARIA labels for all interactive elements
- Live regions for dynamic updates
- Skip navigation links

**Keyboard Navigation:**
- Tab order follows visual hierarchy
- Enter key submits forms
- Escape key closes modals
- Arrow keys navigate dropdowns

**Visual Accessibility:**
- High contrast mode support
- Focus indicators (3px outline)
- Color-blind safe palette
- Text alternatives for icons

---

## Micro-Interactions & Animations

### Button States
```
Default: Solid background
Hover: Slight scale (1.05x) + shadow
Active: Scale (0.98x) + darker shade
Disabled: Opacity 0.5 + cursor not-allowed
Loading: Spinner icon + disabled state
```

### Form Validation
- Green checkmark fade-in on valid input
- Red shake animation on error
- Smooth height transitions for error messages
- Progressive enhancement for real-time validation

### Success Celebrations
- Confetti particle system (CSS only)
- Gift box unwrap animation
- Number counter animation for results
- Staggered fade-in for result items

---

## Requirements

### Functional Requirements

#### Core Features (P0 - Must Have)

**FR1: Participant Entry**
- Accept email addresses via textarea input (one per line)
- Validate email format with visual feedback
- Require minimum 3 participants
- Display participant count in real-time badge
- **Acceptance Criteria:** System accepts valid emails, shows inline validation

**FR2: Pair Generation**
- Generate random Secret Santa pairs where each person gives to exactly one other
- Ensure no self-assignments
- Support re-generation of pairs
- Show progress during generation
- **Acceptance Criteria:** Each participant appears exactly once as giver and receiver

**FR3: Results Display**
- Show all generated pairs clearly with visual hierarchy
- Display timestamp of generation
- Provide visual confirmation of success with animation
- **Acceptance Criteria:** Results show giver→receiver format with status indicators

#### Advanced Features (P1 - Should Have)

**FR4: Exclusion Rules**
- Visual rule builder with dropdowns
- Prevent specific participants from being paired
- Support multiple exclusion rules
- Validate exclusions don't make solution impossible
- **Acceptance Criteria:** System respects all exclusion rules, warns if no solution exists

**FR5: Forced Pairings**
- Guarantee specific participants are paired
- Visual confirmation in rule builder
- Validate forced pairings don't conflict
- **Acceptance Criteria:** Forced pairings always appear in results

**FR6: Name Mapping**
- Map email addresses to display names
- Auto-suggest names from email prefixes
- Use display names in results when available
- **Acceptance Criteria:** Results show names instead of emails when mapped

**FR7: Email Delivery**
- Send assignment emails to participants
- Visual toggle for email delivery
- Track delivery status per recipient with icons
- **Acceptance Criteria:** Emails sent successfully, status displayed per participant

#### Nice-to-Have Features (P2)

**FR8: Export Functionality**
- Copy pairs to clipboard with confirmation toast
- Download results as formatted JSON
- Generate shareable link
- **Acceptance Criteria:** Data exported in usable format

**FR9: Advanced UI Options**
- Smooth collapsible advanced options
- Tabbed interface with icons
- Dark mode support with toggle
- Holiday theme variations
- **Acceptance Criteria:** UI remains clean and intuitive

### Non-Functional Requirements

**Performance**
- Page load time < 2 seconds
- Pair generation < 500ms for up to 100 participants
- API response time < 1 second
- Smooth 60fps animations

**Accessibility**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels and roles
- Focus management for modals

**Browser Support**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile responsive (iOS Safari, Chrome Android)

**Security**
- HTTPS only
- Input validation and sanitization
- No storage of sensitive data in browser
- CORS properly configured
- Rate limiting on API calls

---

## Design Implementation Guidelines

### Component Architecture
```
<Page>
  <Header />
  <MainContent>
    <FormSection>
      <ParticipantInput />
      <EmailToggle />
      <AdvancedOptions>
        <ExclusionsTab />
        <ForcedPairingsTab />
        <NameMappingTab />
      </AdvancedOptions>
      <GenerateButton />
    </FormSection>
    <PreviewSection />
  </MainContent>
  <ResultsModal />
</Page>
```

### State Management
- Form state: React Hook Form
- UI state: Component state
- Results: Lifted state in parent
- Loading states: Global context

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Wide: > 1440px

---

## Success Metrics

### Primary KPIs
- **Task completion rate:** >90% successfully generate pairs
- **Time to complete:** <2 minutes for basic setup
- **Error recovery rate:** >80% resolve issues without leaving
- **Mobile usage:** >40% of sessions

### Secondary Metrics
- Average number of participants per generation
- Percentage using advanced features
- Email delivery success rate
- User return rate during holiday season
- Share/export feature usage

### Measurement Plan
- Implement analytics for user flows
- Heat mapping for UI interactions
- A/B testing for CTA variations
- Session recordings for usability issues
- Error tracking and reporting

---

## Scope and Constraints

### In Scope
- Responsive web application
- Progressive enhancement approach
- Integration with existing Java backend
- Email delivery via backend service
- Basic and advanced pairing options
- Results display and export
- Accessibility compliance
- Mobile-first design

### Out of Scope
- User authentication/accounts
- Saving/loading previous exchanges
- Wish list management
- Budget tracking
- Gift suggestions
- Multi-language support
- Native mobile applications
- Social media integrations
- Payment processing

### Assumptions
- Backend API is already functional and tested
- Email service is configured in backend
- Users have modern web browsers
- Internet connection available
- JavaScript enabled (progressive enhancement)

### Dependencies
- Java Spring Boot backend service operational
- Email service credentials configured
- Vercel account for deployment
- Domain name (optional for MVP)
- ShadCN/UI component library
- TailwindCSS for styling

### Risks
- **Email delivery failures:** Mitigation - Clear status UI, manual copy fallback
- **Complex constraint conflicts:** Mitigation - Visual conflict detection, helpful error messages
- **Browser compatibility:** Mitigation - Progressive enhancement, graceful degradation
- **Performance with large groups:** Mitigation - Pagination, virtual scrolling for large lists
- **Mobile usability:** Mitigation - Touch-first design, extensive device testing

---

## Launch Strategy

### Release Approach
- **Phase 1:** Internal testing with team (1 day)
- **Phase 2:** Beta with 50 users (1 week)
- **Phase 3:** Soft launch with ProductHunt (2 weeks)
- **Phase 4:** Public availability with marketing

### Marketing & Communication
- Landing page with video demo
- ProductHunt launch
- Reddit posts in relevant communities
- SEO optimization for "secret santa generator"
- Social media templates for sharing

### Support Readiness
- Interactive help tooltips
- FAQ section with common scenarios
- Video tutorials for advanced features
- Feedback widget integration
- Error reporting automation

---

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 14+ (App Router)
- **UI Components:** ShadCN/UI
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Analytics:** Posthog
- **Deployment:** Vercel

### Backend Integration
- **Endpoint:** `POST /generatePairs`
- **Protocol:** REST over HTTPS
- **Data Format:** JSON
- **CORS:** Configured for frontend domain
- **Rate Limiting:** 100 requests per hour per IP

### Data Flow
1. Frontend validates and formats user input
2. Shows real-time preview
3. Sends request to backend API
4. Backend processes constraints and generates pairs
5. Backend optionally sends emails
6. Frontend displays results with animations
7. Analytics track completion

---

## Implementation Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Environment Setup | 25 min | Next.js + ShadCN initialized |
| Core Components | 25 min | Form with validation and preview |
| Advanced Features | 15 min | Options tabs with visual builders |
| Animations & Polish | 10 min | Micro-interactions and celebrations |
| Integration & Testing | 5 min | API connection verified |
| Deployment | 5 min | Live on Vercel |
| **Total** | **85 min** | **Polished MVP Complete** |

---

## Appendix

### API Contract

**Request:**
```json
{
  "emails": ["email1@example.com", "email2@example.com"],
  "exclusions": {
    "email1@example.com": ["email2@example.com"]
  },
  "mappings": {
    "email1@example.com": "John Smith"
  },
  "cheats": {
    "email1@example.com": "email2@example.com"
  },
  "emailSendingEnabled": true
}
```

**Response:**
```json
{
  "pairs": [
    {"from": "email1@example.com", "to": "email3@example.com"}
  ],
  "emailStatus": "SUCCESS",
  "emailResults": {
    "email1@example.com": "DELIVERED"
  },
  "errors": [],
  "timestamp": "2025-09-20T10:00:00Z"
}
```

### Design Tokens
```json
{
  "colors": {
    "primary": "#DC2626",
    "secondary": "#059669",
    "background": "#FFFFFF",
    "text": "#1E293B",
    "accent": "#FCD34D",
    "info": "#E0F2FE",
    "muted": "#F3F4F6"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "full": "9999px"
  }
}
```

### Glossary

- **Secret Santa:** Gift exchange where random anonymous assignments determine who gives to whom
- **Exclusion:** Rule preventing specific people from being paired
- **Forced Pairing:** Guaranteed assignment between two participants
- **Name Mapping:** Display name used instead of email address
- **Progressive Disclosure:** UX pattern showing advanced features only when needed
- **Toast:** Temporary notification message
- **ShadCN/UI:** Modern React component library built on Radix UI
- **MVP:** Minimum Viable Product - core features needed for launch

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Sept 2025 | Engineering | Initial PRD creation |
| 2.0 | Sept 2025 | Design Team | Added comprehensive UX/UI design |