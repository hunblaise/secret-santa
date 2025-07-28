# Phase 5: React Frontend Development

## Overview
This phase develops a complete React frontend application with TypeScript, providing an intuitive user interface for the Secret Santa web application. The frontend will consume the backend APIs developed in previous phases and deliver a polished user experience.

## Prerequisites
- Phase 1-4 completed: Full backend implementation (✅)
- All backend APIs functional and documented (✅)
- CORS configured for frontend access (✅)
- API documentation available (✅)

## Objectives
- Create modern React application with TypeScript
- Implement responsive design with Tailwind CSS
- Build comprehensive authentication flow
- Create intuitive group and participant management
- Develop assignment generation and viewing features
- Ensure excellent user experience and accessibility

## Milestone 5.1: React Project Setup and Infrastructure

### Tasks
1. **Initialize Vite + React + TypeScript Project**
   ```bash
   npm create vite@latest secret-santa-frontend -- --template react-ts
   cd secret-santa-frontend
   npm install
   ```

2. **Install Core Dependencies**
   ```json
   {
     "dependencies": {
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "react-router-dom": "^6.8.0",
       "react-hook-form": "^7.43.0",
       "react-query": "@tanstack/react-query@^4.24.0",
       "@tanstack/react-query-devtools": "^4.24.0",
       "axios": "^1.3.0",
       "zod": "^3.20.0",
       "@hookform/resolvers": "^2.9.0",
       "zustand": "^4.3.0",
       "react-hot-toast": "^2.4.0",
       "date-fns": "^2.29.0",
       "lucide-react": "^0.312.0"
     },
     "devDependencies": {
       "@types/react": "^18.0.0",
       "@types/react-dom": "^18.0.0",
       "@vitejs/plugin-react": "^3.1.0",
       "typescript": "^4.9.0",
       "vite": "^4.1.0",
       "tailwindcss": "^3.2.0",
       "autoprefixer": "^10.4.0",
       "postcss": "^8.4.0",
       "@tailwindcss/forms": "^0.5.0",
       "@tailwindcss/typography": "^0.5.0",
       "eslint": "^8.34.0",
       "@typescript-eslint/eslint-plugin": "^5.52.0",
       "@typescript-eslint/parser": "^5.52.0",
       "prettier": "^2.8.0"
     }
   }
   ```

3. **Configure Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```
   
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#eff6ff',
             500: '#3b82f6',
             600: '#2563eb',
             700: '#1d4ed8',
           },
           secondary: {
             50: '#f0fdf4',
             500: '#22c55e',
             600: '#16a34a',
           }
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', 'sans-serif'],
         },
       },
     },
     plugins: [
       require('@tailwindcss/forms'),
       require('@tailwindcss/typography'),
     ],
   }
   ```

4. **Project Structure Setup**
   ```
   src/
   ├── components/
   │   ├── ui/              # Reusable UI components
   │   ├── forms/           # Form components
   │   ├── layout/          # Layout components
   │   └── features/        # Feature-specific components
   ├── pages/               # Page components
   ├── hooks/               # Custom React hooks
   ├── services/            # API services
   ├── stores/              # Zustand stores
   ├── types/               # TypeScript type definitions
   ├── utils/               # Utility functions
   └── lib/                 # Third-party library configurations
   ```

### Acceptance Criteria
- [ ] Vite development server running successfully
- [ ] TypeScript configuration working
- [ ] Tailwind CSS styling functional
- [ ] ESLint and Prettier configured
- [ ] Project structure established
- [ ] Hot reload working in development

## Milestone 5.2: Authentication System

### Tasks
1. **Create Authentication Types**
   ```typescript
   // types/auth.ts
   export interface User {
     id: number;
     email: string;
     firstName: string;
     lastName: string;
     emailVerified: boolean;
     createdAt: string;
     updatedAt: string;
   }
   
   export interface LoginRequest {
     email: string;
     password: string;
   }
   
   export interface RegisterRequest {
     email: string;
     firstName: string;
     lastName: string;
     password: string;
     confirmPassword: string;
   }
   
   export interface AuthResponse {
     token: string;
     refreshToken: string;
     user: User;
   }
   
   export interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     isLoading: boolean;
   }
   ```

2. **Create Authentication Service**
   ```typescript
   // services/authService.ts
   import axios from 'axios';
   import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
   
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
   
   export const authService = {
     async login(credentials: LoginRequest): Promise<AuthResponse> {
       const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
       return response.data.data;
     },
   
     async register(userData: RegisterRequest): Promise<AuthResponse> {
       const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
       return response.data.data;
     },
   
     async refreshToken(refreshToken: string): Promise<AuthResponse> {
       const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
       return response.data.data;
     },
   
     async forgotPassword(email: string): Promise<void> {
       await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
     },
   
     async logout(): Promise<void> {
       // Implement logout logic if needed
     }
   };
   ```

3. **Create Authentication Store**
   ```typescript
   // stores/authStore.ts
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';
   import { AuthState, User } from '../types/auth';
   import { authService } from '../services/authService';
   
   interface AuthStore extends AuthState {
     login: (email: string, password: string) => Promise<void>;
     register: (userData: RegisterRequest) => Promise<void>;
     logout: () => void;
     refreshToken: () => Promise<void>;
     setUser: (user: User) => void;
     setLoading: (loading: boolean) => void;
   }
   
   export const useAuthStore = create<AuthStore>()(
     persist(
       (set, get) => ({
         user: null,
         token: null,
         isAuthenticated: false,
         isLoading: false,
   
         login: async (email: string, password: string) => {
           set({ isLoading: true });
           try {
             const response = await authService.login({ email, password });
             set({
               user: response.user,
               token: response.token,
               isAuthenticated: true,
               isLoading: false,
             });
           } catch (error) {
             set({ isLoading: false });
             throw error;
           }
         },
   
         register: async (userData: RegisterRequest) => {
           set({ isLoading: true });
           try {
             const response = await authService.register(userData);
             set({
               user: response.user,
               token: response.token,
               isAuthenticated: true,
               isLoading: false,
             });
           } catch (error) {
             set({ isLoading: false });
             throw error;
           }
         },
   
         logout: () => {
           set({
             user: null,
             token: null,
             isAuthenticated: false,
           });
         },
   
         refreshToken: async () => {
           const { token } = get();
           if (!token) return;
   
           try {
             const response = await authService.refreshToken(token);
             set({
               user: response.user,
               token: response.token,
             });
           } catch (error) {
             set({
               user: null,
               token: null,
               isAuthenticated: false,
             });
           }
         },
   
         setUser: (user: User) => set({ user }),
         setLoading: (loading: boolean) => set({ isLoading: loading }),
       }),
       {
         name: 'auth-storage',
         partialize: (state) => ({
           user: state.user,
           token: state.token,
           isAuthenticated: state.isAuthenticated,
         }),
       }
     )
   );
   ```

4. **Create Authentication Components**
   ```tsx
   // components/forms/LoginForm.tsx
   import React from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';
   import { useAuthStore } from '../../stores/authStore';
   import { Button } from '../ui/Button';
   import { Input } from '../ui/Input';
   import toast from 'react-hot-toast';
   
   const loginSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(6, 'Password must be at least 6 characters'),
   });
   
   type LoginFormData = z.infer<typeof loginSchema>;
   
   export const LoginForm: React.FC = () => {
     const { login, isLoading } = useAuthStore();
     const {
       register,
       handleSubmit,
       formState: { errors },
     } = useForm<LoginFormData>({
       resolver: zodResolver(loginSchema),
     });
   
     const onSubmit = async (data: LoginFormData) => {
       try {
         await login(data.email, data.password);
         toast.success('Login successful!');
       } catch (error) {
         toast.error('Login failed. Please check your credentials.');
       }
     };
   
     return (
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         <div>
           <Input
             {...register('email')}
             type="email"
             placeholder="Email address"
             error={errors.email?.message}
           />
         </div>
         <div>
           <Input
             {...register('password')}
             type="password"
             placeholder="Password"
             error={errors.password?.message}
           />
         </div>
         <Button
           type="submit"
           className="w-full"
           loading={isLoading}
         >
           Sign In
         </Button>
       </form>
     );
   };
   ```

5. **Create Protected Route Component**
   ```tsx
   // components/layout/ProtectedRoute.tsx
   import React from 'react';
   import { Navigate, useLocation } from 'react-router-dom';
   import { useAuthStore } from '../../stores/authStore';
   import { LoadingSpinner } from '../ui/LoadingSpinner';
   
   interface ProtectedRouteProps {
     children: React.ReactNode;
   }
   
   export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
     const { isAuthenticated, isLoading } = useAuthStore();
     const location = useLocation();
   
     if (isLoading) {
       return <LoadingSpinner />;
     }
   
     if (!isAuthenticated) {
       return <Navigate to="/login" state={{ from: location }} replace />;
     }
   
     return <>{children}</>;
   };
   ```

### Acceptance Criteria
- [ ] User registration and login working
- [ ] JWT token management functional
- [ ] Protected routes redirect to login
- [ ] Authentication state persisted in localStorage
- [ ] Password validation and error handling
- [ ] Logout functionality working

## Milestone 5.3: UI Component Library

### Tasks
1. **Create Base UI Components**
   ```tsx
   // components/ui/Button.tsx
   import React from 'react';
   import { Loader2 } from 'lucide-react';
   import { cn } from '../../utils/cn';
   
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary' | 'outline' | 'danger';
     size?: 'sm' | 'md' | 'lg';
     loading?: boolean;
     children: React.ReactNode;
   }
   
   export const Button: React.FC<ButtonProps> = ({
     variant = 'primary',
     size = 'md',
     loading = false,
     className,
     children,
     disabled,
     ...props
   }) => {
     const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
     
     const variants = {
       primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
       secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
       outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
       danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
     };
     
     const sizes = {
       sm: 'px-3 py-2 text-sm',
       md: 'px-4 py-2 text-sm',
       lg: 'px-6 py-3 text-base',
     };
   
     return (
       <button
         className={cn(baseStyles, variants[variant], sizes[size], className)}
         disabled={disabled || loading}
         {...props}
       >
         {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
         {children}
       </button>
     );
   };
   ```

   ```tsx
   // components/ui/Input.tsx
   import React from 'react';
   import { cn } from '../../utils/cn';
   
   interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
     label?: string;
     error?: string;
     helperText?: string;
   }
   
   export const Input = React.forwardRef<HTMLInputElement, InputProps>(
     ({ label, error, helperText, className, ...props }, ref) => {
       return (
         <div className="space-y-1">
           {label && (
             <label className="block text-sm font-medium text-gray-700">
               {label}
             </label>
           )}
           <input
             ref={ref}
             className={cn(
               'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
               error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
               className
             )}
             {...props}
           />
           {error && (
             <p className="text-sm text-red-600">{error}</p>
           )}
           {helperText && !error && (
             <p className="text-sm text-gray-500">{helperText}</p>
           )}
         </div>
       );
     }
   );
   ```

2. **Create Layout Components**
   ```tsx
   // components/layout/AppLayout.tsx
   import React from 'react';
   import { Outlet } from 'react-router-dom';
   import { Header } from './Header';
   import { Sidebar } from './Sidebar';
   import { useAuthStore } from '../../stores/authStore';
   
   export const AppLayout: React.FC = () => {
     const { isAuthenticated } = useAuthStore();
   
     if (!isAuthenticated) {
       return <Outlet />;
     }
   
     return (
       <div className="min-h-screen bg-gray-50">
         <Header />
         <div className="flex">
           <Sidebar />
           <main className="flex-1 p-6">
             <Outlet />
           </main>
         </div>
       </div>
     );
   };
   ```

   ```tsx
   // components/layout/Header.tsx
   import React from 'react';
   import { Link } from 'react-router-dom';
   import { useAuthStore } from '../../stores/authStore';
   import { Button } from '../ui/Button';
   import { Gift, LogOut, User } from 'lucide-react';
   
   export const Header: React.FC = () => {
     const { user, logout } = useAuthStore();
   
     return (
       <header className="bg-white shadow-sm border-b border-gray-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16">
             <div className="flex items-center">
               <Link to="/dashboard" className="flex items-center space-x-2">
                 <Gift className="h-8 w-8 text-primary-600" />
                 <span className="text-xl font-bold text-gray-900">Secret Santa</span>
               </Link>
             </div>
             
             <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                 <User className="h-5 w-5 text-gray-500" />
                 <span className="text-sm text-gray-700">
                   {user?.firstName} {user?.lastName}
                 </span>
               </div>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={logout}
               >
                 <LogOut className="h-4 w-4 mr-2" />
                 Logout
               </Button>
             </div>
           </div>
         </div>
       </header>
     );
   };
   ```

### Acceptance Criteria
- [ ] Reusable UI components functional
- [ ] Components properly styled with Tailwind
- [ ] Responsive design working on mobile
- [ ] Component library documented
- [ ] TypeScript types properly defined
- [ ] Accessibility features implemented

## Milestone 5.4: Group Management Interface

### Tasks
1. **Create Group Types and Services**
   ```typescript
   // types/group.ts
   export interface Group {
     id: number;
     name: string;
     description: string;
     eventDate: string;
     giftBudget: number;
     status: GroupStatus;
     createdBy: User;
     createdAt: string;
     updatedAt: string;
     participants: Participant[];
     stats: GroupStats;
     permissions: GroupPermissions;
   }
   
   export interface CreateGroupRequest {
     name: string;
     description?: string;
     eventDate: string;
     giftBudget: number;
   }
   
   export interface GroupStats {
     totalParticipants: number;
     acceptedParticipants: number;
     pendingParticipants: number;
     declinedParticipants: number;
     totalExclusions: number;
     totalCheats: number;
     assignmentsGenerated: boolean;
   }
   ```

2. **Create Group Management Components**
   ```tsx
   // components/features/groups/GroupList.tsx
   import React from 'react';
   import { useQuery } from '@tanstack/react-query';
   import { Link } from 'react-router-dom';
   import { Plus, Calendar, Users, DollarSign } from 'lucide-react';
   import { groupService } from '../../../services/groupService';
   import { Button } from '../../ui/Button';
   import { Card } from '../../ui/Card';
   import { formatDate, formatCurrency } from '../../../utils/format';
   
   export const GroupList: React.FC = () => {
     const { data: groups, isLoading, error } = useQuery({
       queryKey: ['groups'],
       queryFn: groupService.getMyGroups,
     });
   
     if (isLoading) return <div>Loading groups...</div>;
     if (error) return <div>Error loading groups</div>;
   
     return (
       <div className="space-y-6">
         <div className="flex justify-between items-center">
           <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
           <Link to="/groups/create">
             <Button>
               <Plus className="h-4 w-4 mr-2" />
               Create Group
             </Button>
           </Link>
         </div>
   
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {groups?.map((group) => (
             <Card key={group.id} className="hover:shadow-lg transition-shadow">
               <div className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
                   {group.name}
                 </h3>
                 
                 <div className="space-y-2 text-sm text-gray-600">
                   <div className="flex items-center">
                     <Calendar className="h-4 w-4 mr-2" />
                     {formatDate(group.eventDate)}
                   </div>
                   <div className="flex items-center">
                     <Users className="h-4 w-4 mr-2" />
                     {group.stats.totalParticipants} participants
                   </div>
                   <div className="flex items-center">
                     <DollarSign className="h-4 w-4 mr-2" />
                     {formatCurrency(group.giftBudget)} budget
                   </div>
                 </div>
   
                 <div className="mt-4 pt-4 border-t border-gray-200">
                   <Link
                     to={`/groups/${group.id}`}
                     className="text-primary-600 hover:text-primary-700 font-medium"
                   >
                     View Details →
                   </Link>
                 </div>
               </div>
             </Card>
           ))}
         </div>
       </div>
     );
   };
   ```

   ```tsx
   // components/features/groups/CreateGroupForm.tsx
   import React from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';
   import { useMutation, useQueryClient } from '@tanstack/react-query';
   import { useNavigate } from 'react-router-dom';
   import { groupService } from '../../../services/groupService';
   import { Button } from '../../ui/Button';
   import { Input } from '../../ui/Input';
   import { Textarea } from '../../ui/Textarea';
   import { Card } from '../../ui/Card';
   import toast from 'react-hot-toast';
   
   const createGroupSchema = z.object({
     name: z.string().min(1, 'Group name is required').max(100),
     description: z.string().max(500).optional(),
     eventDate: z.string().min(1, 'Event date is required'),
     giftBudget: z.number().min(0.01, 'Gift budget must be positive').max(10000),
   });
   
   type CreateGroupFormData = z.infer<typeof createGroupSchema>;
   
   export const CreateGroupForm: React.FC = () => {
     const navigate = useNavigate();
     const queryClient = useQueryClient();
     
     const {
       register,
       handleSubmit,
       formState: { errors },
     } = useForm<CreateGroupFormData>({
       resolver: zodResolver(createGroupSchema),
     });
   
     const createGroupMutation = useMutation({
       mutationFn: groupService.createGroup,
       onSuccess: (group) => {
         queryClient.invalidateQueries({ queryKey: ['groups'] });
         toast.success('Group created successfully!');
         navigate(`/groups/${group.id}`);
       },
       onError: () => {
         toast.error('Failed to create group');
       },
     });
   
     const onSubmit = (data: CreateGroupFormData) => {
       createGroupMutation.mutate({
         ...data,
         eventDate: new Date(data.eventDate).toISOString(),
       });
     };
   
     return (
       <div className="max-w-2xl mx-auto">
         <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Group</h1>
         
         <Card>
           <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
             <Input
               {...register('name')}
               label="Group Name"
               placeholder="e.g., Office Christmas 2024"
               error={errors.name?.message}
             />
   
             <Textarea
               {...register('description')}
               label="Description (Optional)"
               placeholder="Brief description of your Secret Santa group"
               error={errors.description?.message}
             />
   
             <Input
               {...register('eventDate')}
               type="datetime-local"
               label="Event Date"
               error={errors.eventDate?.message}
             />
   
             <Input
               {...register('giftBudget', { valueAsNumber: true })}
               type="number"
               step="0.01"
               label="Gift Budget"
               placeholder="25.00"
               error={errors.giftBudget?.message}
             />
   
             <div className="flex space-x-4">
               <Button
                 type="submit"
                 loading={createGroupMutation.isPending}
                 className="flex-1"
               >
                 Create Group
               </Button>
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => navigate('/dashboard')}
               >
                 Cancel
               </Button>
             </div>
           </form>
         </Card>
       </div>
     );
   };
   ```

### Acceptance Criteria
- [ ] Group creation form working with validation
- [ ] Group list displays with proper information
- [ ] Group editing functionality implemented
- [ ] Group deletion with confirmation
- [ ] Responsive design for mobile devices
- [ ] Loading states and error handling

## Milestone 5.5: Participant Management Interface

### Tasks
1. **Create Participant Components**
   ```tsx
   // components/features/participants/ParticipantList.tsx
   import React from 'react';
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
   import { Mail, UserPlus, MoreVertical, Trash2, Send } from 'lucide-react';
   import { participantService } from '../../../services/participantService';
   import { Button } from '../../ui/Button';
   import { Badge } from '../../ui/Badge';
   import { DropdownMenu } from '../../ui/DropdownMenu';
   import { ConfirmDialog } from '../../ui/ConfirmDialog';
   import toast from 'react-hot-toast';
   
   interface ParticipantListProps {
     groupId: number;
   }
   
   export const ParticipantList: React.FC<ParticipantListProps> = ({ groupId }) => {
     const queryClient = useQueryClient();
     const [showInviteModal, setShowInviteModal] = React.useState(false);
     const [participantToDelete, setParticipantToDelete] = React.useState<number | null>(null);
   
     const { data: participants, isLoading } = useQuery({
       queryKey: ['participants', groupId],
       queryFn: () => participantService.getParticipants(groupId),
     });
   
     const removeParticipantMutation = useMutation({
       mutationFn: (participantId: number) => 
         participantService.removeParticipant(groupId, participantId),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['participants', groupId] });
         toast.success('Participant removed successfully');
         setParticipantToDelete(null);
       },
       onError: () => {
         toast.error('Failed to remove participant');
       },
     });
   
     const resendInvitationMutation = useMutation({
       mutationFn: (participantId: number) => 
         participantService.resendInvitation(groupId, participantId),
       onSuccess: () => {
         toast.success('Invitation resent successfully');
       },
       onError: () => {
         toast.error('Failed to resend invitation');
       },
     });
   
     if (isLoading) return <div>Loading participants...</div>;
   
     return (
       <div className="space-y-4">
         <div className="flex justify-between items-center">
           <h3 className="text-lg font-semibold text-gray-900">
             Participants ({participants?.length || 0})
           </h3>
           <Button onClick={() => setShowInviteModal(true)}>
             <UserPlus className="h-4 w-4 mr-2" />
             Invite Participants
           </Button>
         </div>
   
         <div className="bg-white rounded-lg border border-gray-200">
           {participants?.length === 0 ? (
             <div className="p-8 text-center">
               <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">
                 No participants yet
               </h3>
               <p className="text-gray-500 mb-4">
                 Start by inviting people to join your Secret Santa group.
               </p>
               <Button onClick={() => setShowInviteModal(true)}>
                 Invite First Participant
               </Button>
             </div>
           ) : (
             <div className="divide-y divide-gray-200">
               {participants?.map((participant) => (
                 <div key={participant.id} className="p-4 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                     <div className="flex-shrink-0">
                       <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                         <span className="text-primary-600 font-medium">
                           {participant.firstName.charAt(0)}
                           {participant.lastName.charAt(0)}
                         </span>
                       </div>
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">
                         {participant.firstName} {participant.lastName}
                       </p>
                       <p className="text-sm text-gray-500">{participant.email}</p>
                     </div>
                   </div>
   
                   <div className="flex items-center space-x-3">
                     <Badge variant={getStatusVariant(participant.status)}>
                       {participant.status}
                     </Badge>
   
                     <DropdownMenu
                       trigger={
                         <Button variant="outline" size="sm">
                           <MoreVertical className="h-4 w-4" />
                         </Button>
                       }
                     >
                       {participant.status === 'PENDING' && (
                         <DropdownMenu.Item
                           onClick={() => resendInvitationMutation.mutate(participant.id)}
                         >
                           <Send className="h-4 w-4 mr-2" />
                           Resend Invitation
                         </DropdownMenu.Item>
                       )}
                       <DropdownMenu.Item
                         onClick={() => setParticipantToDelete(participant.id)}
                         className="text-red-600"
                       >
                         <Trash2 className="h-4 w-4 mr-2" />
                         Remove
                       </DropdownMenu.Item>
                     </DropdownMenu>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
   
         {/* Invite Modal and Confirm Dialog components */}
       </div>
     );
   };
   ```

2. **Create Invitation Components**
   ```tsx
   // components/features/participants/InviteParticipantModal.tsx
   import React from 'react';
   import { useForm, useFieldArray } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';
   import { useMutation, useQueryClient } from '@tanstack/react-query';
   import { X, Plus, Trash2 } from 'lucide-react';
   import { participantService } from '../../../services/participantService';
   import { Modal } from '../../ui/Modal';
   import { Button } from '../../ui/Button';
   import { Input } from '../../ui/Input';
   import toast from 'react-hot-toast';
   
   const inviteSchema = z.object({
     participants: z.array(
       z.object({
         email: z.string().email('Invalid email'),
         firstName: z.string().min(1, 'First name required'),
         lastName: z.string().min(1, 'Last name required'),
         personalMessage: z.string().optional(),
       })
     ).min(1, 'At least one participant required'),
   });
   
   type InviteFormData = z.infer<typeof inviteSchema>;
   
   interface InviteParticipantModalProps {
     groupId: number;
     isOpen: boolean;
     onClose: () => void;
   }
   
   export const InviteParticipantModal: React.FC<InviteParticipantModalProps> = ({
     groupId,
     isOpen,
     onClose,
   }) => {
     const queryClient = useQueryClient();
     
     const {
       register,
       control,
       handleSubmit,
       reset,
       formState: { errors },
     } = useForm<InviteFormData>({
       resolver: zodResolver(inviteSchema),
       defaultValues: {
         participants: [{ email: '', firstName: '', lastName: '', personalMessage: '' }],
       },
     });
   
     const { fields, append, remove } = useFieldArray({
       control,
       name: 'participants',
     });
   
     const inviteMutation = useMutation({
       mutationFn: (data: InviteFormData) =>
         participantService.bulkInviteParticipants(groupId, data.participants),
       onSuccess: (results) => {
         queryClient.invalidateQueries({ queryKey: ['participants', groupId] });
         const successCount = results.filter(r => r.status === 'SENT').length;
         toast.success(`${successCount} invitation(s) sent successfully`);
         reset();
         onClose();
       },
       onError: () => {
         toast.error('Failed to send invitations');
       },
     });
   
     const onSubmit = (data: InviteFormData) => {
       inviteMutation.mutate(data);
     };
   
     return (
       <Modal isOpen={isOpen} onClose={onClose} title="Invite Participants">
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
           <div className="space-y-4">
             {fields.map((field, index) => (
               <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                 <div className="flex justify-between items-center mb-4">
                   <h4 className="text-sm font-medium text-gray-900">
                     Participant {index + 1}
                   </h4>
                   {fields.length > 1 && (
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={() => remove(index)}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   )}
                 </div>
   
                 <div className="grid grid-cols-2 gap-4">
                   <Input
                     {...register(`participants.${index}.firstName`)}
                     placeholder="First Name"
                     error={errors.participants?.[index]?.firstName?.message}
                   />
                   <Input
                     {...register(`participants.${index}.lastName`)}
                     placeholder="Last Name"
                     error={errors.participants?.[index]?.lastName?.message}
                   />
                 </div>
   
                 <div className="mt-4">
                   <Input
                     {...register(`participants.${index}.email`)}
                     type="email"
                     placeholder="Email Address"
                     error={errors.participants?.[index]?.email?.message}
                   />
                 </div>
   
                 <div className="mt-4">
                   <Input
                     {...register(`participants.${index}.personalMessage`)}
                     placeholder="Personal message (optional)"
                   />
                 </div>
               </div>
             ))}
           </div>
   
           <Button
             type="button"
             variant="outline"
             onClick={() => append({ email: '', firstName: '', lastName: '', personalMessage: '' })}
             className="w-full"
           >
             <Plus className="h-4 w-4 mr-2" />
             Add Another Participant
           </Button>
   
           <div className="flex space-x-4">
             <Button
               type="submit"
               loading={inviteMutation.isPending}
               className="flex-1"
             >
               Send Invitations
             </Button>
             <Button
               type="button"
               variant="outline"
               onClick={onClose}
             >
               Cancel
             </Button>
           </div>
         </form>
       </Modal>
     );
   };
   ```

### Acceptance Criteria
- [ ] Participant invitation form working
- [ ] Bulk participant invitation functionality
- [ ] Participant status tracking and display
- [ ] Invitation resending capability
- [ ] Participant removal with confirmation
- [ ] Real-time status updates

## Milestone 5.6: Assignment Generation and Viewing

### Tasks
1. **Create Assignment Components**
   ```tsx
   // components/features/assignments/AssignmentGenerator.tsx
   import React from 'react';
   import { useMutation, useQueryClient } from '@tanstack/react-query';
   import { Shuffle, Mail, Eye } from 'lucide-react';
   import { assignmentService } from '../../../services/assignmentService';
   import { Button } from '../../ui/Button';
   import { Card } from '../../ui/Card';
   import { ConfirmDialog } from '../../ui/ConfirmDialog';
   import toast from 'react-hot-toast';
   
   interface AssignmentGeneratorProps {
     groupId: number;
     hasExistingAssignments: boolean;
     canGenerate: boolean;
   }
   
   export const AssignmentGenerator: React.FC<AssignmentGeneratorProps> = ({
     groupId,
     hasExistingAssignments,
     canGenerate,
   }) => {
     const queryClient = useQueryClient();
     const [showConfirm, setShowConfirm] = React.useState(false);
     const [deliveryMode, setDeliveryMode] = React.useState<'sync' | 'async'>('sync');
   
     const generateMutation = useMutation({
       mutationFn: () => assignmentService.generateAssignments(groupId, deliveryMode),
       onSuccess: (response) => {
         queryClient.invalidateQueries({ queryKey: ['group', groupId] });
         queryClient.invalidateQueries({ queryKey: ['assignments', groupId] });
         
         if (response.emailStatus === 'SUCCESS') {
           toast.success('Assignments generated and emails sent successfully!');
         } else if (response.emailStatus === 'PARTIAL') {
           toast.success('Assignments generated! Some emails failed to send.');
         } else {
           toast.success('Assignments generated successfully!');
         }
         
         setShowConfirm(false);
       },
       onError: (error: any) => {
         toast.error(error.response?.data?.message || 'Failed to generate assignments');
       },
     });
   
     const handleGenerate = () => {
       if (hasExistingAssignments) {
         setShowConfirm(true);
       } else {
         generateMutation.mutate();
       }
     };
   
     if (!canGenerate) {
       return (
         <Card>
           <div className="p-6 text-center">
             <Shuffle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">
               Ready to Generate Assignments?
             </h3>
             <p className="text-gray-500 mb-4">
               You need at least 3 participants who have accepted their invitations 
               to generate Secret Santa assignments.
             </p>
           </div>
         </Card>
       );
     }
   
     return (
       <>
         <Card>
           <div className="p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Shuffle className="h-6 w-6 text-primary-600" />
               <h3 className="text-lg font-semibold text-gray-900">
                 Generate Assignments
               </h3>
             </div>
   
             <p className="text-gray-600 mb-6">
               Generate Secret Santa assignments for all participants. 
               {hasExistingAssignments && ' This will replace existing assignments.'}
             </p>
   
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Email Delivery
                 </label>
                 <div className="space-y-2">
                   <label className="flex items-center">
                     <input
                       type="radio"
                       value="sync"
                       checked={deliveryMode === 'sync'}
                       onChange={(e) => setDeliveryMode(e.target.value as 'sync')}
                       className="mr-2"
                     />
                     <span className="text-sm">Send emails immediately (recommended)</span>
                   </label>
                   <label className="flex items-center">
                     <input
                       type="radio"
                       value="async"
                       checked={deliveryMode === 'async'}
                       onChange={(e) => setDeliveryMode(e.target.value as 'async')}
                       className="mr-2"
                     />
                     <span className="text-sm">Send emails in background</span>
                   </label>
                 </div>
               </div>
   
               <Button
                 onClick={handleGenerate}
                 loading={generateMutation.isPending}
                 className="w-full"
               >
                 <Shuffle className="h-4 w-4 mr-2" />
                 {hasExistingAssignments ? 'Regenerate' : 'Generate'} Assignments
               </Button>
             </div>
           </div>
         </Card>
   
         <ConfirmDialog
           isOpen={showConfirm}
           onClose={() => setShowConfirm(false)}
           onConfirm={() => generateMutation.mutate()}
           title="Regenerate Assignments?"
           description="This will create new assignments and replace the existing ones. All participants will receive new assignment emails."
           confirmText="Regenerate"
           cancelText="Cancel"
         />
       </>
     );
   };
   ```

2. **Create Assignment Viewing Component**
   ```tsx
   // components/features/assignments/AssignmentViewer.tsx
   import React from 'react';
   import { useQuery } from '@tanstack/react-query';
   import { Eye, Mail, Clock, CheckCircle } from 'lucide-react';
   import { assignmentService } from '../../../services/assignmentService';
   import { Card } from '../../ui/Card';
   import { Badge } from '../../ui/Badge';
   import { formatDate } from '../../../utils/format';
   
   interface AssignmentViewerProps {
     groupId: number;
   }
   
   export const AssignmentViewer: React.FC<AssignmentViewerProps> = ({ groupId }) => {
     const { data: assignments, isLoading } = useQuery({
       queryKey: ['assignments', groupId],
       queryFn: () => assignmentService.getAssignments(groupId),
     });
   
     if (isLoading) return <div>Loading assignments...</div>;
   
     if (!assignments || assignments.length === 0) {
       return (
         <Card>
           <div className="p-6 text-center">
             <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">
               No Assignments Yet
             </h3>
             <p className="text-gray-500">
               Generate assignments to see who's giving gifts to whom.
             </p>
           </div>
         </Card>
       );
     }
   
     return (
       <Card>
         <div className="p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">
             Assignments ({assignments.length})
           </h3>
           
           <div className="space-y-3">
             {assignments.map((assignment) => (
               <div
                 key={assignment.id}
                 className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
               >
                 <div className="flex items-center space-x-3">
                   <div className="text-sm">
                     <span className="font-medium text-gray-900">
                       {assignment.giver.firstName} {assignment.giver.lastName}
                     </span>
                     <span className="text-gray-500 mx-2">→</span>
                     <span className="font-medium text-gray-900">
                       {assignment.receiver.firstName} {assignment.receiver.lastName}
                     </span>
                   </div>
                 </div>
   
                 <div className="flex items-center space-x-3">
                   <div className="text-xs text-gray-500">
                     Generated {formatDate(assignment.generatedAt)}
                   </div>
                   
                   {assignment.viewedAt ? (
                     <Badge variant="success">
                       <CheckCircle className="h-3 w-3 mr-1" />
                       Viewed
                     </Badge>
                   ) : (
                     <Badge variant="warning">
                       <Clock className="h-3 w-3 mr-1" />
                       Pending
                     </Badge>
                   )}
                 </div>
               </div>
             ))}
           </div>
         </div>
       </Card>
     );
   };
   ```

### Acceptance Criteria
- [ ] Assignment generation working with algorithm integration
- [ ] Assignment viewing for group administrators
- [ ] Email delivery options (sync/async)
- [ ] Assignment status tracking (viewed/pending)
- [ ] Regeneration functionality with confirmation
- [ ] Proper error handling for algorithm failures

## Testing Requirements

### Unit Tests
- [ ] Component rendering tests
- [ ] Form validation tests
- [ ] State management tests
- [ ] Utility function tests

### Integration Tests
- [ ] Authentication flow testing
- [ ] API integration testing
- [ ] Routing and navigation tests
- [ ] End-to-end user workflows

### Accessibility Tests
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast compliance
- [ ] Focus management

## Performance Optimization

### Bundle Optimization
- [ ] Code splitting by routes
- [ ] Lazy loading for components
- [ ] Tree shaking for unused code
- [ ] Image optimization

### Runtime Performance
- [ ] React Query caching strategy
- [ ] Component memoization
- [ ] Virtual scrolling for large lists
- [ ] Debounced search inputs

## Success Criteria

### Phase 5 Complete When:
- [ ] User registration and authentication working
- [ ] Group CRUD operations functional
- [ ] Participant management complete
- [ ] Assignment generation and viewing working
- [ ] Responsive design on all devices
- [ ] Error handling and loading states implemented
- [ ] Performance targets met
- [ ] Accessibility requirements satisfied
- [ ] Ready for Phase 6 deployment

### Performance Targets
- [ ] Initial page load < 3 seconds
- [ ] Route navigation < 500ms
- [ ] Form submissions < 1 second
- [ ] Bundle size < 500KB gzipped

### Quality Gates
- [ ] All tests pass
- [ ] TypeScript compilation without errors
- [ ] ESLint rules passing
- [ ] Lighthouse score > 90
- [ ] Cross-browser compatibility verified