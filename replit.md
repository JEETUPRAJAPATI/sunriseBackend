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

**June 20, 2025 - Fixed Subcategory Database Storage and Display Issues**
- Fixed database schema inconsistency between `subCategories` and `subcategories` fields
- Enhanced backend category controllers to properly handle subcategory data with validation and filtering
- Improved frontend subcategory state management with proper useEffect handling and console logging
- Enhanced subcategory input component with better visual design and user feedback
- Added proper data filtering to remove empty subcategories before database storage
- Fixed category form submission to include all required fields (name, description, subcategories)
- Added comprehensive logging for debugging subcategory creation and editing operations
- Improved visual hierarchy with sectioned subcategory management and scrollable input areas

**June 20, 2025 - Completed Subcategory Integration and Fixed React Import Issue**
- Resolved React import error that was preventing inventory form from loading
- Fixed subcategory dropdown display in item creation/editing forms
- Implemented React.useMemo for efficient subcategory lookup and filtering
- Added comprehensive debugging output to track category selection and subcategory retrieval
- Enhanced form validation to clear subcategory when parent category changes
- Verified database integration with proper subcategory storage and retrieval from MongoDB
- Completed full subcategory workflow from creation to display in inventory forms

**June 20, 2025 - Implemented Proper JWT Authentication System**
- Migrated from cookie-based authentication to proper JWT token system using Authorization headers
- Updated backend middleware to prioritize Bearer tokens over cookies for authentication
- Enhanced frontend API client to automatically include JWT tokens in all requests via localStorage
- Fixed React rendering error in toast notifications by properly handling JSX components
- Implemented automatic token storage and retrieval in login/logout flows
- Added descending order sorting for inventory items to show latest records first
- Fixed duplicate item code generation to auto-generate new codes when conflicts occur
- Enhanced error handling and authentication flow for better security

**June 21, 2025 - Complete Excel Import/Export System Implementation**
- Implemented comprehensive Excel functionality for all inventory modules (items, categories, customer categories, customers, suppliers)
- Added three-button system: Export to Excel, Download Template, and Import from Excel with proper authentication
- Created backend controllers for customers and suppliers with full Excel processing capabilities
- Enhanced ExcelImportExport component with template generation and support for all module types
- Integrated API services with proper JWT authentication for all Excel operations
- Added visual progress tracking, detailed error reporting, and success notifications
- Implemented automatic list refresh after successful imports with proper cache invalidation
- Removed duplicate modules and cleaned up unnecessary components while maintaining full functionality

**June 21, 2025 - Fixed Category Management Modal Issues and Cleaned Duplicate Code**
- Fixed CategoryManagement component to properly handle separate category and customer category modals
- Removed console debugging logs and restored clean button functionality
- Enhanced Excel import process with better database verification and logging
- Cleaned up duplicate code while preserving all existing functionality
- Ensured both Categories and Customer Categories buttons open their respective modals correctly
- Maintained all Excel import/export functionality with improved error tracking

**June 21, 2025 - Complete Company Management Module Implementation**
- Created comprehensive Company Management module with full CRUD functionality
- Implemented MongoDB schema with company fields: unitName, name, mobile, email, address, locationPin, city, state, country, gst, fssai, orderCutoffTime
- Added complete backend with routes, controllers, validation, and error handling
- Created modern React frontend with table view, filtering, and modal-based forms
- Implemented sectioned forms with shadcn/ui components: Company Info, Location, Legal Info, Timing
- Added detailed company view modal with organized information display
- Integrated permission-based access control for Super User and Unit Head roles
- Added seeded sample data with 8 diverse companies across different cities and units
- Enhanced sidebar navigation with Companies menu item and Building2 icon
- Implemented proper validation, error handling, and success notifications

**June 21, 2025 - Fixed QuickAddCategory API Integration and Enhanced Form UX**
- Fixed API endpoint routing issues in QuickAddCategory component by adding proper /api/ prefixes
- Resolved "Unexpected token DOCTYPE" JSON parsing error that was preventing category creation
- Enhanced error handling and response parsing to support different backend response formats
- Successfully integrated + icon buttons for quick category creation directly within inventory forms
- Implemented real-time category selection after successful creation with proper cache invalidation
- Added comprehensive logging and debugging for category creation operations
- Fixed Excel export headers across all modules to use proper binary file handling and quoted filenames

**June 21, 2025 - Simplified Excel Export System**
- Completely removed complex Excel generation system and replaced with simple, reliable approach
- Created simplified createSimpleExcel utility function with basic XLSX.write() implementation
- Removed all complex formatting, styling, and advanced options that were causing compatibility issues
- Streamlined all export controllers to use basic data mapping with essential fields only
- Simplified HTTP response handling using res.send() instead of complex header management
- Fixed duplicate components and removed unnecessary complexity from Excel generation
- Ensured all data shows properly in Excel files with clean, simple structure
- Added proper error handling and logging for debugging export issues
- Used timestamp-based filename generation for unique file naming

**June 21, 2025 - Client-Side Excel Export Implementation**
- Completely replaced server-side Excel generation with client-side solution using xlsx and file-saver libraries
- Created ClientExcelExporter utility class with proper XLSX.utils.json_to_sheet() and XLSX.write() methods
- Fixed config.exportFn error by implementing direct client-side export functions in handleExport
- Enhanced template generation with comprehensive sample data for all module types
- Implemented proper error handling and toast notifications for export operations
- Ensured Excel files use correct MIME type (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- Added data fetching methods (getCategories, getCustomers, etc.) for real-time export functionality
- Removed problematic server-side Excel generation code that was causing format issues

**Current Status**: Complete ERP system with fully functional client-side Excel export generating proper .xlsx files that open correctly in Microsoft Excel, comprehensive import/export across all modules, proper JWT authentication, fully functional subcategory management, working category management modals, complete Company Management with CRUD operations, modern UI with three-button Excel system (Export, Template, Import), working QuickAddCategory integration with + icon buttons, and seamless integration between all modules with secure token-based authentication.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```