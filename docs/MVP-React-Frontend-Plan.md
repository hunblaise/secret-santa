# React + Vite MVP Frontend Plan

## Overview
Create a simple React frontend using Vite that directly calls the existing `POST /generatePairs` endpoint. This MVP will provide immediate value with minimal complexity while leveraging the existing robust backend algorithm and email system.

## What We Have (Backend API Analysis)

### Existing Endpoint
- **URL**: `POST /generatePairs`
- **Controller**: `SecretSantaController.java`
- **Service**: Full orchestration with `SecretSantaOrchestrationService`

### Request Format (`SecretSantaRequest`)
```json
{
  "emails": ["john@email.com", "jane@email.com", "bob@email.com"],
  "exclusions": {
    "john@email.com": ["jane@email.com"]
  },
  "mappings": {
    "john@email.com": "John Smith",
    "jane@email.com": "Jane Doe"
  },
  "cheats": {
    "john@email.com": "jane@email.com"
  },
  "emailSendingEnabled": true
}
```

### Response Format (`SecretSantaResponse`)
```json
{
  "pairs": [
    {"from": "john@email.com", "to": "bob@email.com"},
    {"from": "jane@email.com", "to": "john@email.com"},
    {"from": "bob@email.com", "to": "jane@email.com"}
  ],
  "emailStatus": "SUCCESS",
  "emailResults": {
    "john@email.com": "DELIVERED",
    "jane@email.com": "DELIVERED",
    "bob@email.com": "DELIVERED"
  },
  "errors": [],
  "timestamp": "2024-01-15T10:30:00"
}
```

### Email Status Options
- `SUCCESS` - All emails delivered
- `FAILED` - Email delivery failed
- `PARTIAL` - Some emails failed
- `DISABLED` - Email sending was disabled
- `PENDING` - Async email delivery in progress

## Implementation Plan

### Step 1: Project Setup (15 minutes)

#### 1.1 Create Vite Project
```bash
cd /mnt/c/dev/projects/secret-santa
npm create vite@latest frontend -- --template react-ts
cd frontend
```

#### 1.2 Install Dependencies
```bash
npm install axios react-hook-form @hookform/resolvers zod
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms
npm install lucide-react react-hot-toast
npx tailwindcss init -p
```

#### 1.3 Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── forms/           # Form components
│   │   └── results/         # Results display components
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── App.tsx              # Main application
├── public/
└── package.json
```

### Step 2: CORS Configuration (5 minutes)

#### 2.1 Backend CORS Setup
Add to Spring Boot backend (`src/main/java/.../config/CorsConfig.java`):
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        corsConfig.addAllowedOriginPattern("http://localhost:5173"); // Vite dev server
        corsConfig.addAllowedHeader("*");
        corsConfig.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }
}
```

### Step 3: Core Components (45 minutes)

#### 3.1 TypeScript Types
```typescript
// types/api.ts
export interface SecretSantaRequest {
  emails: string[];
  exclusions?: Record<string, string[]>;
  mappings?: Record<string, string>;
  cheats?: Record<string, string>;
  emailSendingEnabled: boolean;
}

export interface Pair {
  from: string;
  to: string;
}

export interface SecretSantaResponse {
  pairs: Pair[];
  emailStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'DISABLED' | 'PENDING';
  emailResults: Record<string, string>;
  errors: string[];
  timestamp: string;
}
```

#### 3.2 API Service
```typescript
// services/secretSantaService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const secretSantaService = {
  async generatePairs(request: SecretSantaRequest): Promise<SecretSantaResponse> {
    const response = await axios.post(`${API_BASE_URL}/generatePairs`, request);
    return response.data;
  }
};
```

#### 3.3 Main App Component
```typescript
// App.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ParticipantForm } from './components/forms/ParticipantForm';
import { AdvancedOptions } from './components/forms/AdvancedOptions';
import { ResultsDisplay } from './components/results/ResultsDisplay';
import { secretSantaService } from './services/secretSantaService';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const [results, setResults] = useState<SecretSantaResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (data: SecretSantaRequest) => {
    setLoading(true);
    try {
      const response = await secretSantaService.generatePairs(data);
      setResults(response);
      if (response.errors.length === 0) {
        toast.success('Secret Santa pairs generated successfully!');
      } else {
        toast.error('Generated with some errors');
      }
    } catch (error) {
      toast.error('Failed to generate pairs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App content */}
      <Toaster position="top-right" />
    </div>
  );
}
```

#### 3.4 Form Components

**Participant Form**:
- Textarea for bulk email input (one per line)
- Email validation and duplicate detection
- Name mapping builder (optional)

**Advanced Options** (Collapsible):
- Exclusions builder (A cannot give to B)
- Forced pairings builder (A must give to B)
- Email sending toggle

#### 3.5 Results Display
- Success/error state visualization
- Pairs display in elegant format (A → B)
- Email delivery status indicators
- Copy to clipboard functionality
- Export options (JSON, CSV)

### Step 4: API Integration (15 minutes)

#### 4.1 Error Handling
```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
```

#### 4.2 Request Transformation
```typescript
// utils/requestBuilder.ts
export const buildSecretSantaRequest = (formData: FormData): SecretSantaRequest => {
  return {
    emails: parseEmails(formData.emailsText),
    exclusions: buildExclusionsMap(formData.exclusions),
    mappings: buildMappingsMap(formData.nameMappings),
    cheats: buildCheatsMap(formData.forcedPairings),
    emailSendingEnabled: formData.sendEmails
  };
};
```

### Step 5: Polish & UX (30 minutes)

#### 5.1 Responsive Design
- Mobile-first approach with Tailwind CSS
- Collapsible sections for mobile
- Touch-friendly form controls

#### 5.2 Loading States
- Spinner during API calls
- Disabled form during processing
- Progress indicators for long operations

#### 5.3 User Experience
- Form validation with clear error messages
- Help text and examples
- Keyboard shortcuts (Ctrl+Enter to generate)
- Auto-save form data to localStorage

#### 5.4 Professional Styling
```css
/* Example Tailwind classes */
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.button-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500;
}
```

## MVP Features Included

### Core Features
- ✅ **Participant Management**: Bulk email input with validation
- ✅ **Email Toggle**: Enable/disable automatic email sending
- ✅ **Exclusions**: Prevent specific pairings
- ✅ **Forced Pairings**: Guarantee specific assignments
- ✅ **Name Mappings**: Display names instead of emails
- ✅ **Results Visualization**: Clear pair display
- ✅ **Email Status**: Delivery tracking and status

### User Experience
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Error Handling**: Clear error messages and recovery
- ✅ **Loading States**: Visual feedback during processing
- ✅ **Form Validation**: Real-time validation with helpful messages
- ✅ **Copy/Export**: Easy sharing of results
- ✅ **Help & Examples**: Onboarding for new users

### Technical Features
- ✅ **TypeScript**: Type safety throughout
- ✅ **Modern React**: Hooks and functional components
- ✅ **Form Management**: React Hook Form with Zod validation
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **Performance**: Optimized rendering and API calls

## Time Estimate

| Phase | Task | Time |
|-------|------|------|
| Setup | Project creation and dependencies | 15 min |
| Backend | CORS configuration | 5 min |
| Core | Form components and logic | 25 min |
| Core | Results display and status | 15 min |
| Core | API integration | 5 min |
| Integration | Error handling and validation | 10 min |
| Polish | Responsive design | 15 min |
| Polish | Loading states and UX | 15 min |
| **Total** | | **~2 hours** |

## User Journey

### Primary Flow
1. **Landing**: User sees clean, professional interface
2. **Input**: Bulk paste participant emails (one per line)
3. **Configure**: Optionally set exclusions and forced pairings
4. **Generate**: Click button to generate assignments
5. **Results**: View pairs with email delivery status
6. **Share**: Copy or export results

### Advanced Flow
1. **Name Mapping**: Set display names for participants
2. **Complex Exclusions**: Set multiple exclusion rules
3. **Email Control**: Choose whether to send emails
4. **Regenerate**: Try different configurations easily

## Deployment Strategy

### Development
```bash
cd frontend
npm run dev  # Starts on http://localhost:5173
```

### Production Build
```bash
npm run build  # Creates dist/ folder
npm run preview  # Preview production build
```

### Hosting Options
- **Vercel**: Zero-config deployment from Git
- **Netlify**: Drag-and-drop deployment
- **GitHub Pages**: Free static hosting
- **Self-hosted**: Serve dist/ folder with any web server

## Next Steps After MVP

### Immediate Enhancements (Week 1-2)
- Save/load configurations
- Recent generations history
- Improved error messages
- Keyboard shortcuts
- Print-friendly results

### Short-term Features (Month 1)
- User accounts and saved groups
- Scheduled generation
- Email template customization
- Advanced exclusion rules
- Participant status tracking

### Long-term Evolution (Month 2+)
- Multi-group management
- Participant self-service portal
- Mobile app
- Integration with calendar apps
- Advanced analytics and reporting

## Success Metrics

### Technical
- [ ] Page load time < 2 seconds
- [ ] Form submission response < 5 seconds
- [ ] Zero critical accessibility issues
- [ ] Works on mobile and desktop
- [ ] Handles 100+ participant groups

### User Experience
- [ ] Intuitive without instructions
- [ ] Error messages are helpful
- [ ] Results are clearly presented
- [ ] Process is faster than manual methods
- [ ] Users can easily repeat the process

## Risk Mitigation

### Backend Dependency
- **Risk**: Backend API changes or downtime
- **Mitigation**: Comprehensive error handling, graceful degradation

### Performance
- **Risk**: Large participant lists cause slowdown
- **Mitigation**: Input validation, loading states, chunked processing

### User Errors
- **Risk**: Invalid email formats or impossible constraints
- **Mitigation**: Real-time validation, helpful error messages, examples

### Browser Compatibility
- **Risk**: Older browsers don't support modern features
- **Mitigation**: Polyfills, progressive enhancement, graceful fallbacks

## Conclusion

This MVP provides immediate value by adding a professional frontend to the existing robust Secret Santa algorithm. The 2-hour development time makes it an extremely cost-effective way to validate user interest and gather feedback before investing in more complex features.

The existing backend remains unchanged, ensuring the sophisticated algorithm and email delivery system continue to work perfectly while users get a much better experience than direct API calls or manual processes.