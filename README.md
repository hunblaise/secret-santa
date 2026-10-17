# 🎅 Secret Santa Generator

A modern full-stack Secret Santa experience featuring a festive Next.js frontend and a graph-theory powered Spring Boot backend. Participants can generate balanced gift exchanges with real-time validation, exclusions, forced pairings, and optional email delivery.

## ✨ Features

- **🌟 Intuitive Frontend Experience**: Responsive Christmas-themed UI with real-time validation, accessibility focus, and advanced configuration tabs
- **🔄 Guaranteed Valid Assignments**: Hamiltonian-cycle search ensures everyone gives and receives exactly one gift
- **🚫 Exclusion Support**: Prevent specific people from drawing each other (e.g., couples, family members)
- **🎯 Forced Pairings**: Allow predetermined "cheat" assignments that must occur
- **🏷️ Display Name Mapping**: Replace emails with custom names for friendlier announcements
- **📧 Transactional Email Delivery**: Optional Resend HTTP API integration with delayed retries and delivery results
- **🛡️ Robust Error Handling**: Explicit failure when a complete cycle is impossible, clear toast/error messaging

## 🧰 Technology Stack

### Frontend
- **Next.js 16.4.2** with Turbopack development server
- **React 19 + TypeScript** for type-safe component authoring
- **shadcn/ui** + Radix primitives with Tailwind CSS design system
- **React Hook Form + Zod** for form state and validation
- **Vitest** + Testing Library for component/integration tests
- **Lucide React** & **Sonner** for icons and toasts

### Backend
- **Spring Boot 4.1.1** (WebFlux) running on **Java 21 LTS**
- **Graph-based assignment algorithm** with constraint propagation
- **Resend Java SDK 4.28.0** for email notifications
- **Maven** build with **JaCoCo**, **Mockito 5**, and **Jib 3.4.6** for Docker images

## 🚀 Quick Start

### Prerequisites
- **Java 21 LTS** and **Maven 3.9+** (wrapper included)
- **Node.js 24.22.0 LTS** (see `.nvmrc`) with **npm**
- (Optional) Resend API key and a verified sender domain for email delivery

### 1. Clone and install
```bash
git clone <repository-url>
cd secret-santa

# Backend dependencies are resolved on demand by Maven wrapper

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Run the stack locally
```bash
# Terminal 1 - Backend
cd backend
./mvnw spring-boot:run
# Serves API at http://localhost:8080

# Terminal 2 - Frontend
cd frontend
npm run dev
# Serves UI at http://localhost:3000
```

The frontend is preconfigured to call the backend at `http://localhost:8080` (CORS enabled).

### 3. Generate Secret Santa pairs
Use the web UI or call the backend directly:
```bash
curl -X POST http://localhost:8080/generatePairs \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["alice@example.com", "bob@example.com", "charlie@example.com"],
    "exclusions": {
      "alice@example.com": ["bob@example.com"]
    },
    "mappings": {
      "alice@example.com": "Alice Smith",
      "bob@example.com": "Bob Jones",
      "charlie@example.com": "Charlie Brown"
    },
    "cheats": {},
    "emailSendingEnabled": false
  }'
```

## 📡 API Reference

### POST /generatePairs
Generates Secret Santa assignments for a group of participants.

**Request Body**
```json
{
  "emails": ["string"],
  "exclusions": {
    "email": ["excluded_emails"]
  },
  "mappings": {
    "email": "display_name"
  },
  "cheats": {
    "giver_email": "receiver_email"
  },
  "emailSendingEnabled": true
}
```

**Response**
```json
{
  "pairs": [
    { "from": "giver@example.com", "to": "receiver@example.com" }
  ],
  "emailStatus": "SUCCESS",
  "emailResults": {
    "giver@example.com": "DELIVERED"
  },
  "errors": [],
  "timestamp": "2024-12-20T10:30:00"
}
```

## ⚙️ Configuration

### Email Setup (Optional)
Set your Resend API key before launching the backend:
```bash
export SECRET_SANTA_RESEND_API_KEY=re_your_api_key
```

Configure `secret-santa.email.from` in `backend/src/main/resources/application.properties` to use a sender on your verified Resend domain. The default test key permits local startup but cannot deliver real mail.

`secret-santa.email.retry.attempts` is the number of retries after the initial attempt. Retries use exponential backoff starting at `secret-santa.email.retry.delay` milliseconds, apply only to transient errors, and reuse an idempotency key to avoid duplicate sends. API acceptance is reported as `DELIVERED`; inbox delivery is not confirmed by a webhook.

The API accepts 2–100 unique participants. Forced pairs must reference existing participants, cannot target oneself or reuse a recipient, and must respect exclusions. All assignments form one cycle. Difficult constraints can hit the 200,000-step search limit and return a retryable failure even when a solution exists.

Synchronous email mode is the default. Async mode runs in memory and returns `PENDING`; use a durable queue and persisted delivery status if restart-safe processing is needed.

## 🧪 Development Workflow

### Backend Commands
```bash
./mvnw clean install           # Clean build with tests
./mvnw test                    # Run backend test suite
./mvnw test -Dtest=ClassName   # Run specific test class or method
./mvnw jacoco:report           # Coverage report
./mvnw spring-boot:run         # Start API locally
./mvnw jib:dockerBuild         # Build Docker image
./mvnw deploy jib:build -P deploy-docker  # Build & push (requires registry access)
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Production build
npm start            # Run production build
npm test             # Vitest suite
npm run test:coverage
npm run lint         # ESLint
npm run typecheck    # TypeScript project check
```

## 📁 Project Structure
```
backend/
  src/main/java/...            # Spring Boot services, controllers, algorithms
  src/test/java/...            # Backend unit & integration tests
frontend/
  app/                         # Next.js app router
  components/                  # UI and form components
  lib/                         # API client, utilities, shared types
  __tests__/                   # Vitest component/integration tests
```

## 🧮 Algorithm Highlights
1. Build a directed graph where vertices are participants and edges represent allowed giver → receiver pairs
2. Apply exclusions (remove edges) and forced pairings (lock edges)
3. Execute Hamiltonian-cycle style backtracking with constraint propagation
4. Return a structured failure with no pairs or email delivery if no complete cycle exists; a bounded search prevents runaway work

## 🔒 Security & Best Practices
- Credentials supplied via environment variables; no secrets in code
- Input validation on both frontend (Zod) and backend (business rules)
- Modern, maintained dependency stack across frontend and backend
- Comprehensive testing (backend, frontend, and integration workflows)

## 🎄 Example Use Cases
- Office parties that require guaranteed unique pairings and printable results
- Family gatherings where certain relationships must be avoided
- Friend groups that want to force special surprise pairings
- Large events where manual matching becomes error-prone

---

**Made with ❤️ to spread holiday joy for every team, family, and friend group! 🎁**
