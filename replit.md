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

**June 20, 2025 - Complete Modern Inventory UI Redesign**
- Created completely new modern, responsive inventory management interface
- Implemented card-based design with advanced stats dashboard showing total items, value, low stock, and categories
- Built comprehensive filtering system with search, category selection, and sorting options
- Redesigned table with modern dropdown actions menu and improved data visualization
- Enhanced category management with tabbed interface for product and customer categories
- Added proper loading states, skeleton components, and empty states throughout
- Integrated simplified form component with working validation and error handling
- Implemented responsive design for mobile, tablet, and desktop viewports
- Added modern icons, proper spacing, and professional color schemes
- Fixed all form submission issues and real-time state updates

**June 20, 2025 - Complete Frontend Error Handling and Modern Form Implementation**
- Completely refactored inventory form with comprehensive error handling and modern sectioned UI
- Implemented structured error capture from backend validation with inline field messages and red borders
- Created sectioned form layout: Item Information, Category Information, Pricing, Stock Information
- Added comprehensive validation with real-time error display and submit button state management
- Enhanced backend responses with consistent success flags and structured error objects
- Implemented toast notifications for validation summaries and success/error feedback
- Added visual error indicators, form state management, and auto-scroll to error fields
- Ensured immediate UI refresh after successful form submissions with forced cache invalidation
- Fixed all form value binding issues and real-time state synchronization problems

**June 20, 2025 - Smart Toast Notifications with Error Categorization**
- Implemented intelligent error categorization system with automatic error type detection
- Created smart toast notifications with context-aware messages and severity-based styling
- Added actionable error buttons with appropriate responses (retry, login, refresh, etc.)
- Implemented network status monitoring with automatic online/offline notifications
- Enhanced validation error handling with field-specific highlighting and auto-scroll
- Added loading toasts for better user feedback during operations
- Created comprehensive toast utility library with success, warning, info, and error variants
- Integrated batch operation notifications for multi-item actions
- Added duration management based on error severity levels

**June 20, 2025 - Final Inventory Module Completion and Duplicate Component Cleanup**
- Removed all duplicate inventory components and consolidated to single modern component
- Fixed database schema issues and made customerCategory field optional with default values
- Corrected API endpoint routing issues preventing frontend-backend communication
- Enhanced form data processing to ensure all field values are properly captured and submitted
- Implemented comprehensive server-side validation with structured JSON error responses
- Fixed TypeScript compilation errors and form component conflicts
- Established seamless real-time state synchronization with immediate UI updates
- Completed integration of smart toast notifications with error categorization throughout inventory module

**June 20, 2025 - Modern Interactive UI Redesign and Error Resolution**
- Created modern gradient action bar with Quick Actions (Add Item, Add Category, Customer Category, Refresh)
- Fixed categories.map error with proper API response data extraction and array validation
- Redesigned CategoryManagement component with modern tabbed interface and gradient headers
- Enhanced table design with alternating row colors, better spacing, and professional styling
- Implemented color-coded buttons with proper theme integration for light/dark modes
- Added comprehensive error handling for all form operations with smart toast notifications
- Created modern dialog forms with centered icons and improved visual hierarchy
- Fixed DOM nesting warnings by replacing p tags with div elements in stats components

**June 20, 2025 - Complete UI Overhaul with Modern Design**
- Completely redesigned inventory interface with modern grid layout and navigation sidebar
- Removed redundant tabs and replaced with clean button navigation system
- Implemented professional card-based layout with gradient headers and clean spacing
- Created dedicated views for Categories and Customer Categories with seamless switching
- Enhanced visual hierarchy with improved typography, spacing, and color schemes
- Integrated modern action buttons with hover effects and proper theme support
- Streamlined user experience by removing duplicate navigation elements
- Added comprehensive CRUD operations for both category types with modern dialogs

**June 20, 2025 - Advanced Modal-Based Category Management System**
- Implemented comprehensive modal-based Category Management with nested forms and dynamic subcategory management
- Created interactive Category Management Modal displaying all existing categories with their subcategories in card format
- Added dynamic subcategory input system allowing multiple subcategories to be added/removed during category creation/editing
- Built Customer Category Management Modal with table view and comprehensive CRUD operations
- Integrated Edit and Delete icons for each category item with pre-filled forms and confirmation modals
- Implemented scrollable content areas with sectioned headers ("Existing Categories", "Add New") for better organization
- Added real-time form validation, toast notifications, and automatic list refresh without page reload
- Created modern dialog interfaces with centered icons, proper visual hierarchy, and theme integration
- Enhanced user experience with loading states, empty states, and comprehensive error handling

**June 20, 2025 - UI Cleanup and Enhanced Category Display**
- Removed unnecessary sidebar navigation for cleaner, streamlined interface
- Enhanced Category Management Modal with proper table layout showing categories, descriptions, and subcategories
- Improved subcategory display with badge system and "more" indicator for multiple subcategories
- Fixed subcategory state management with proper useEffect handling for edit operations
- Enhanced Customer Category Modal with improved table structure and visual hierarchy
- Increased modal height for better content viewing and scrolling experience
- Added proper tooltips for action buttons and improved accessibility
- Optimized layout for full-width content display without sidebar constraints

**Current Status**: Complete ERP system with streamlined inventory management interface featuring enhanced modal-based category management, clean table layouts, dynamic subcategory handling, comprehensive CRUD operations, and optimized user experience without unnecessary navigation elements.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```