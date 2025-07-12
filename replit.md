# Replit.md - Supplier Management System

## Overview

This is a full-stack web application built for managing suppliers and products with a focus on supplier-product associations. The application features a React frontend with shadcn/ui components and a Node.js/Express backend with PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives wrapped in shadcn/ui components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **File Uploads**: Multer for handling image uploads
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Schema
The application manages three main entities:
- **Suppliers**: Company information including CNPJ, contact details
- **Products**: Product information with barcode, category, quantity tracking
- **Supplier-Product Associations**: Many-to-many relationship between suppliers and products

### API Structure
RESTful API endpoints for:
- `/api/suppliers` - CRUD operations for suppliers
- `/api/products` - CRUD operations for products  
- `/api/associations` - Managing supplier-product relationships
- File upload endpoints for product images

### Form Validation
- CNPJ validation with proper formatting
- Phone number formatting
- Email validation
- Required field validation using Zod schemas

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests, validate data, and interact with database
3. **Database Operations**: Drizzle ORM manages PostgreSQL queries and relationships
4. **Response Handling**: Data flows back through the API to update React Query cache
5. **UI Updates**: Components automatically re-render based on query state changes

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database
- **Connection**: Uses connection pooling via `@neondatabase/serverless`

### UI Components
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TSX**: TypeScript execution for development
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development
- Uses Vite dev server for frontend hot reloading
- TSX for backend development with auto-restart
- Drizzle Kit for database schema management

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: ESBuild bundles server code with external dependencies
- Database: Drizzle migrations handle schema updates

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- File upload directory: `uploads/` (needs to be created)

### Key Scripts
- `npm run dev`: Start development servers
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Push schema changes to database

## Notable Features

- **CNPJ Validation**: Brazilian company identifier validation and formatting
- **Image Upload**: Product image handling with file type validation
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Form Handling**: Robust form validation with user-friendly error messages
- **Real-time Updates**: Query invalidation ensures data consistency across components