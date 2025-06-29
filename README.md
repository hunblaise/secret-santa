# 🎅 Secret Santa Generator

A modern Spring Boot application that generates optimal Secret Santa gift assignments using advanced graph theory algorithms. Each participant gives exactly one gift and receives exactly one gift, with support for exclusions and predetermined assignments.

## ✨ Features

- **🔄 Guaranteed Valid Assignments**: Uses real Hamiltonian cycle algorithm to ensure everyone participates
- **🚫 Exclusion Support**: Prevent specific people from drawing each other (e.g., couples, family members)
- **🎯 Predetermined Assignments**: Force specific gift-giving relationships ("cheats")
- **📧 Email Notifications**: Automatic email delivery with personalized messages
- **🌐 Reactive API**: Built with Spring WebFlux for scalable, non-blocking operations
- **🛡️ Robust Error Handling**: Graceful fallback when perfect assignments aren't possible

## 🚀 Quick Start

### Prerequisites

- **Java 21 LTS** or later
- **Maven 3.9+** (or use included wrapper)

### Running the Application

```bash
# Clone the repository
git clone <repository-url>
cd secret-santa

# Run the application
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

### Generate Secret Santa Pairs

Send a POST request to `/generatePairs`:

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

**Response:**
```json
[
  {"from": "alice@example.com", "to": "charlie@example.com"},
  {"from": "bob@example.com", "to": "alice@example.com"},
  {"from": "charlie@example.com", "to": "bob@example.com"}
]
```

## 📋 API Reference

### POST /generatePairs

Generates Secret Santa assignments for a group of participants.

**Request Body:**
```json
{
  "emails": ["string"],           // List of participant email addresses
  "exclusions": {                 // Optional: people who can't give to each other
    "email": ["excluded_emails"]
  },
  "mappings": {                   // Optional: email to display name mapping
    "email": "display_name"
  },
  "cheats": {                     // Optional: predetermined assignments
    "giver_email": "receiver_email"
  },
  "emailSendingEnabled": boolean  // Whether to send notification emails
}
```

**Response:**
Array of gift-giving pairs:
```json
[
  {
    "from": "giver@example.com",
    "to": "receiver@example.com"
  }
]
```

## 🔧 Configuration

### Email Setup (Optional)

To enable email notifications, set these environment variables:

```bash
export SECRET_SANTA_GMAIL_USERNAME=your-email@gmail.com
export SECRET_SANTA_GMAIL_PASSWORD=your-app-password
```

**Note:** Use Gmail App Passwords, not your regular password.

### Application Properties

The application uses Gmail SMTP by default. Modify `src/main/resources/application.properties` for different email providers:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${SECRET_SANTA_GMAIL_USERNAME}
spring.mail.password=${SECRET_SANTA_GMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

## 🧪 Development

### Running Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=HamiltonianTourServiceTest

# Run with coverage report
./mvnw clean test jacoco:report
```

### Building

```bash
# Clean build
./mvnw clean install

# Build Docker image
./mvnw jib:dockerBuild
```

### Docker Deployment

```bash
# Build and push to registry
./mvnw jib:build -P deploy-docker
```

## 🧮 Algorithm Details

### Hamiltonian Cycle Approach

The application uses a sophisticated **backtracking algorithm** to find valid Secret Santa assignments:

1. **Graph Construction**: Participants become vertices, valid gift relationships become edges
2. **Constraint Application**: Exclusions remove edges, cheats force specific paths
3. **Hamiltonian Search**: Find a cycle visiting each person exactly once
4. **Backtracking**: Try all possibilities with intelligent pruning
5. **Fallback Strategy**: Best-effort assignment when perfect cycle impossible

### Performance

- **Time Complexity**: O(N!) worst case, optimized with constraint pruning
- **Practical Performance**: Excellent for typical groups (≤20 people)
- **Memory Usage**: O(N) space for path tracking

### Guarantees

✅ **Everyone participates**: Each person gives and receives exactly one gift  
✅ **Constraints respected**: All exclusions and predetermined assignments honored  
✅ **Deterministic**: Same input produces same output (with controlled randomization)  
✅ **Graceful degradation**: Fallback when constraints make perfect assignment impossible  

## 📁 Project Structure

```
src/
├── main/java/com/balazs/hajdu/secretsanta/
│   ├── controller/
│   │   └── SecretSantaController.java     # REST API endpoint
│   ├── domain/
│   │   ├── Graph.java                     # Graph representation
│   │   ├── Vertex.java                    # Graph vertex
│   │   ├── request/SecretSantaRequest.java # API request model
│   │   └── response/Pair.java             # Gift-giving pair
│   ├── service/
│   │   ├── GraphMappingService.java       # Converts request to graph
│   │   ├── HamiltonianTourService.java    # Core algorithm
│   │   ├── MailingService.java            # Email notifications
│   │   └── hamiltonian/
│   │       ├── ConstraintValidator.java   # Validates constraints
│   │       └── TourState.java             # Algorithm state tracking
│   └── SecretSantaApplication.java        # Spring Boot main class
└── test/java/                             # Comprehensive test suite
```

## 🏗️ Technology Stack

- **Java 21 LTS** - Modern Java with latest features
- **Spring Boot 3.4.5** - Web framework with reactive programming
- **Spring WebFlux** - Reactive, non-blocking web stack
- **Maven** - Dependency management and build
- **JUnit 5** - Testing framework
- **Mockito 5** - Mocking for unit tests
- **Docker** - Containerization via Jib plugin

## 🔒 Security

- **No Sensitive Data**: Application doesn't store personal information
- **Environment Variables**: Email credentials via environment variables only
- **Input Validation**: Robust validation of all API inputs
- **Modern Dependencies**: Updated to latest secure versions (Spring Boot 3.x, Java 21)

## 🎄 Example Use Cases

- **Office Holiday Parties**: Organize gift exchanges with budget constraints
- **Family Gatherings**: Ensure cousins don't draw siblings, etc.
- **Friend Groups**: Prevent couples from drawing each other
- **Large Events**: Handle complex exclusion rules automatically

---

**Made with ❤️ for spreading holiday joy! 🎁**