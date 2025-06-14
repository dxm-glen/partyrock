# Changelog

All notable changes to the Korean Language Learning Platform will be documented in this file.

## [2.1.0] - 2025-06-14

### 🔐 Security & Authentication
- **CHANGED**: Admin password updated to `16!^109a`
- **ADDED**: Dynamic password change functionality in admin panel
- **ENHANCED**: Admin API authentication with proper header validation
- **FIXED**: Authentication middleware for protected endpoints

### 📚 Tutorial Management
- **ADDED**: Comprehensive tutorial management interface
- **ADDED**: Real-time editing modal for all tutorial fields
- **ADDED**: Publication status control (public/private toggle)
- **ADDED**: Complete tutorial deletion with confirmation
- **ENHANCED**: Detailed tutorial information display including URLs, metadata, and statistics
- **ADDED**: Database schema `published` field for content visibility control

### 🎯 Content Administration
- **IMPROVED**: S3 URL-based upload system replacing file uploads
- **ADDED**: Thumbnail and subtitle URL management
- **ENHANCED**: Category and difficulty tag editing
- **ADDED**: Duration tracking and display
- **IMPROVED**: View count analytics

### 🏗️ Technical Infrastructure
- **ADDED**: New API endpoints:
  - `GET /api/admin/tutorials` - Fetch all tutorials including private
  - `PATCH /api/tutorials/:id` - Update tutorial fields
  - `DELETE /api/tutorials/:id` - Remove tutorials
  - `POST /api/auth/admin/change-password` - Update admin credentials
- **IMPROVED**: Database storage interface with publication filtering
- **ENHANCED**: React Query integration for efficient caching
- **FIXED**: TypeScript type safety improvements

### 🎨 User Interface
- **REDESIGNED**: Admin panel with comprehensive tutorial overview
- **ADDED**: Edit modal with all tutorial fields
- **IMPROVED**: Badge system for status indication
- **ENHANCED**: Responsive layout for mobile devices
- **ADDED**: Loading states and error handling

### 🧪 Testing & Validation
- **TESTED**: Tutorial deletion and re-upload workflow
- **VERIFIED**: Publication status changes
- **CONFIRMED**: Password change functionality
- **VALIDATED**: S3 URL integration

## [2.0.0] - 2025-06-10

### 🛡️ Security Features
- **ADDED**: Comprehensive video download prevention
- **IMPLEMENTED**: Right-click blocking on video content
- **ADDED**: Keyboard shortcut prevention (F12, Ctrl+S, Ctrl+U)
- **ENHANCED**: CSS-based content protection

### 📺 Video Platform
- **ADDED**: 4 tutorial videos hosted on AWS S3
- **IMPLEMENTED**: Secure video streaming infrastructure
- **ADDED**: Admin panel for content management
- **ENHANCED**: Video player with security restrictions

### 🏠 Core Platform
- **BUILT**: React.js responsive frontend
- **CREATED**: Express.js backend with PostgreSQL
- **IMPLEMENTED**: User authentication system
- **DESIGNED**: Tutorial and app gallery structure

---

## Legend
- **ADDED**: New features
- **CHANGED**: Changes to existing functionality
- **DEPRECATED**: Soon-to-be removed features
- **REMOVED**: Removed features
- **FIXED**: Bug fixes
- **SECURITY**: Security improvements
- **ENHANCED**: Improvements to existing features
- **TESTED**: Validation and testing updates