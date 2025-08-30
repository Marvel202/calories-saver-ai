# Replit.md

## Overview

Calories Saver AI is a web application that uses artificial intelligence to analyze meal photos and provide detailed nutritional information. Users can upload photos of their meals, and the AI processes these images to extract calorie counts, macronutrients (protein, carbs, fat), and identify food items with confidence ratings. The app features a modern, neomorphic design with instant analysis capabilities and user feedback collection to continuously improve accuracy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing with single home page and 404 fallback
- **State Management**: TanStack Query for server state management and caching with custom query client
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom design system featuring neomorphic elements and CSS variables for theming
- **File Uploads**: Uppy dashboard with S3-compatible object storage integration

### Backend Architecture
- **Runtime**: Node.js with Express.js server providing REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations and schema management
- **File Storage**: Google Cloud Storage integration for meal photo uploads with ACL-based access control
- **Development**: Hot module replacement with Vite integration and custom logging middleware
- **Production**: Static file serving with build optimization using esbuild

### Database Schema
- **Users Table**: Basic user management with username/password authentication
- **Meal Analyses Table**: Stores analysis results with nutrition data (JSON), feedback ratings, and image URLs
- **Schema Validation**: Zod schemas for runtime type checking and API validation

### Data Flow
- Users upload meal photos through Uppy component to Google Cloud Storage
- Server processes images via external AI service (n8n workflow webhook)
- Nutrition analysis results stored in PostgreSQL with user feedback capability
- Frontend displays results with interactive feedback collection (1-4 star rating system)

## External Dependencies

- **Database**: Neon serverless PostgreSQL for scalable data storage
- **Object Storage**: Google Cloud Storage via Replit sidecar for secure file management
- **AI Processing**: n8n workflow webhooks for meal analysis (configurable via N8N_WEBHOOK_URL environment variable)
- **UI Components**: Radix UI primitives for accessibility-compliant interactive elements
- **File Handling**: Uppy for robust file upload experience with progress tracking
- **Development Tools**: Replit-specific plugins for error overlay and cartographer integration