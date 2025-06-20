# Manufacturing ERP System

## Overview

This is a full-stack Manufacturing Enterprise Resource Planning (ERP) system built with React frontend and Express.js backend. The system is designed to manage various aspects of manufacturing operations including orders, production, inventory, dispatches, sales, and accounts. The application features role-based access control with different user roles having specific permissions for different modules.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite for fast development and building
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Context-based auth with protected routes

### Backend Architecture
- **Framework**: Express.js with TypeScript support
- **Database**: Dual database support - MongoDB (legacy) and PostgreSQL (new)
- **ORM**: Drizzle ORM for PostgreSQL with type-safe queries
- **Authentication**: JWT-based authentication with role-based authorization
- **API Design**: RESTful API with Express routing
- **Development**: Hot reload with tsx for TypeScript execution

### Database Design
The system supports two database configurations:

**PostgreSQL (Current)**:
- Drizzle ORM for type safety
- Schema defined in `shared/schema.ts`
- Migrations handled by Drizzle Kit

**MongoDB (Legacy)**:
- Mongoose ODM
- Models in `server/models/` directory
- Complete schema for all business entities

## Key Components

### User Management & Authentication
- Role-based access control with 6 user roles:
  - Super User (full access)
  - Unit Head (management level)
  - Production (manufacturing focus)
  - Packing (packaging operations)
  - Dispatch (shipping and delivery)
  - Accounts (financial operations)
- JWT-based authentication with secure cookie storage
- Module-based permissions system

### Business Modules
1. **Dashboard**: Real-time metrics and analytics
2. **Orders**: Customer order management and tracking
3. **Manufacturing**: Production planning and execution
4. **Dispatches**: Shipping and delivery management
5. **Sales**: Invoice generation and sales tracking
6. **Accounts**: Financial management and reporting
7. **Inventory**: Stock management with low-stock alerts
8. **Customers**: Customer relationship management
9. **Suppliers**: Vendor management
10. **Purchases**: Purchase order management
11. **Settings**: System configuration

### UI Components
- Comprehensive component library using Shadcn/ui
- Responsive design with mobile-first approach
- Dark/light theme support
- Accessibility-focused components
- Form validation and error handling

## Data Flow

1. **Authentication Flow**:
   - User login → JWT token generation → Cookie storage → Protected route access
   - Role-based module access based on user permissions

2. **API Request Flow**:
   - Frontend components → TanStack Query → API service layer → Express routes → Database operations

3. **Real-time Updates**:
   - Query invalidation for data consistency
   - Optimistic updates for better UX

## External Dependencies

### Frontend Dependencies
- **UI & Styling**: Tailwind CSS, Radix UI components, Lucide React icons
- **State & Data**: TanStack Query for server state, React Hook Form for forms
- **Utilities**: date-fns for date handling, clsx for conditional styling

### Backend Dependencies
- **Database**: Drizzle ORM for PostgreSQL, Mongoose for MongoDB
- **Authentication**: JWT for tokens, bcrypt for password hashing
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution, Vite for frontend building

### Third-party Services
- **Database**: Neon serverless PostgreSQL for production
- **Development**: Replit for cloud development environment

## Deployment Strategy

### Development Environment
- Replit-based development with hot reload
- Vite dev server for frontend with HMR
- tsx for backend TypeScript execution
- PostgreSQL database provisioned through Replit

### Production Build
- Frontend: Vite build generates optimized static assets
- Backend: esbuild bundles server code for Node.js
- Database: Drizzle migrations for schema management
- Deployment: Replit autoscale deployment target

### Environment Configuration
- Development: `npm run dev` starts both frontend and backend
- Production: `npm run build` → `npm run start`
- Database: `npm run db:push` for schema updates

## Recent Changes

**June 18, 2025 - Modern Admin Panel Implementation**
- Replaced login screen with attractive demo accounts selection page
- Implemented modern, responsive UI with gradient backgrounds and glass-morphism effects
- Added comprehensive dark/light mode toggle throughout the application
- Enhanced sidebar with improved styling and theme integration
- Created interactive demo accounts showcase with role-based permissions display
- Implemented responsive design patterns for mobile, tablet, and desktop
- Added proper loading states and smooth transitions
- Integrated theme toggle in both sidebar and mobile header

**June 19, 2025 - Dashboard Modernization**
- Removed work timer section for cleaner, more professional appearance
- Replaced timer with Quick Overview panel showing key business metrics
- Streamlined clock display and improved layout spacing
- Fixed profile picture upload issues and resolved route conflicts
- Enhanced overall dashboard user experience

**June 20, 2025 - Enhanced Inventory Management System**
- Implemented comprehensive inventory form with structured sections (Item Details, Category Info, Pricing, Stock Info)
- Added customer category field integration with MongoDB schema
- Enhanced backend validation with detailed JSON error responses
- Improved frontend error handling with inline field messages and toast notifications
- Added loading states, form validation, and auto-scroll to error fields
- Created modern, responsive UI using shadcn/ui components with color-coded sections
- Implemented proper data sanitization and field-specific error display

**June 20, 2025 - Critical Inventory Module Fixes**
- Fixed Customer Category field binding and MongoDB integration for add/edit operations
- Enhanced server-side validation with structured JSON error responses including success flags
- Implemented comprehensive frontend error handling with toast notifications and inline field messages
- Refactored form validation to prevent submission when errors exist and show visual error cues
- Added proper form state management with red borders for invalid fields and disabled submit buttons
- Improved real-time state updates with proper query invalidation and forced refetches
- Fixed all form control value binding issues using controlled components

**Current Status**: Complete ERP system with modern UI design and fully functional inventory management. All validation, error handling, and real-time updates working correctly. Customer Category field properly integrated with MongoDB. Professional error messaging and user feedback implemented throughout.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```