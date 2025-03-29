# EventraAI User Management System

## Overview

This document outlines the implementation details for the EventraAI user management system. It covers the technical approach, component architecture, and implementation details for user authentication, role-based access control, user preferences, and profile management.

## Implemented Components

### User Authentication

#### Authentication System
- **Implementation**: Supabase authentication with custom UI components
- **Technical Decision**: Use Supabase Auth to handle session management and security
- **Component Structure**:
  ```typescript
  <AuthProvider>
    <LoginForm onSubmit={handleLogin} />
    <RegisterForm onSubmit={handleRegister} />
    <PasswordResetFlow 
      requestReset={handleRequestReset}
      confirmReset={handleConfirmReset}
    />
    <SocialLoginButtons providers={['google', 'facebook']} />
  </AuthProvider>
  ```
- **API Integration**:
  - Supabase authentication APIs
  - `POST /api/auth/register-complete` - Complete registration process
  - `POST /api/auth/verify-email` - Handle email verification

#### Session Management
- **Implementation**: Secure session handling with token refresh
- **Technical Decision**: Use HTTP-only cookies for session tokens
- **Component Structure**:
  ```typescript
  <SessionManager>
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  </SessionManager>
  ```
- **Security Features**:
  - Automatic token refresh
  - Session timeout handling
  - Device management
  - Concurrent session limitation

### Role-Based Access Control

#### Permission System
- **Implementation**: Dynamic permission system with role assignments
- **Technical Decision**: Custom RBAC implementation with Supabase RLS
- **Component Structure**:
  ```typescript
  <RoleManager>
    <RoleList roles={roles} onEdit={handleEditRole} />
    <PermissionMatrix 
      permissions={permissions} 
      roles={roles} 
      onUpdate={handleUpdatePermissions} 
    />
    <UserRoleAssignment users={users} roles={roles} onAssign={handleAssignRole} />
  </RoleManager>
  ```
- **API Integration**:
  - `GET /api/roles` - Fetch available roles
  - `POST /api/roles` - Create new role
  - `PUT /api/roles/:id` - Update role
  - `GET /api/permissions` - Fetch permission definitions
  - `PUT /api/users/:id/roles` - Assign role to user

#### Access Control Components
- **Implementation**: UI components for controlling access to features
- **Technical Decision**: Higher-order components and hooks for permission checks
- **Component Structure**:
  ```typescript
  // Protect routes
  <ProtectedRoute requiredPermission="events.create">
    {children}
  </ProtectedRoute>
  
  // Protect UI elements
  <PermissionGuard permission="events.delete">
    <DeleteButton onClick={handleDelete} />
  </PermissionGuard>
  
  // Custom hook usage
  const canCreateEvent = usePermission('events.create');
  ```
- **API Integration**:
  - `GET /api/user/permissions` - Fetch current user's permissions
  - Permission check middleware for API routes

### User Preferences

#### Preferences Management
- **Implementation**: User-specific settings and preferences
- **Technical Decision**: Store preferences in user metadata with local caching
- **Component Structure**:
  ```typescript
  <PreferencesManager>
    <PreferencesForm
      preferences={userPreferences}
      onSave={handleSavePreferences}
    />
    <NotificationSettings
      settings={notificationSettings}
      onUpdate={handleUpdateNotifications}
    />
    <DisplaySettings
      settings={displaySettings}
      onUpdate={handleUpdateDisplay}
    />
  </PreferencesManager>
  ```
- **API Integration**:
  - `GET /api/user/preferences` - Fetch user preferences
  - `PUT /api/user/preferences` - Update user preferences
  - `GET /api/user/notifications/settings` - Fetch notification settings
  - `PUT /api/user/notifications/settings` - Update notification settings

#### Theme Selection
- **Implementation**: Dark/light mode toggle with theme customization
- **Technical Decision**: Theme context with local storage persistence
- **Component Structure**:
  ```typescript
  <ThemeProvider>
    <ThemeSelector
      currentTheme={theme}
      onChange={handleThemeChange}
    />
    <ColorSchemeCustomizer
      colors={colors}
      onChange={handleColorChange}
    />
  </ThemeProvider>
  ```
- **API Integration**:
  - `PUT /api/user/theme` - Save theme preference to user account

### Profile Management

#### User Profile
- **Implementation**: Profile editing and management interface
- **Technical Decision**: Form-based profile editing with avatar upload
- **Component Structure**:
  ```typescript
  <ProfileManager>
    <ProfileHeader
      user={user}
      avatarUrl={avatarUrl}
      onAvatarChange={handleAvatarChange}
    />
    <ProfileForm
      profile={userProfile}
      onSave={handleSaveProfile}
    />
    <PasswordChange
      onSubmit={handlePasswordChange}
    />
    <AccountDeletion
      onRequestDeletion={handleRequestDeletion}
    />
  </ProfileManager>
  ```
- **API Integration**:
  - `GET /api/user/profile` - Fetch user profile
  - `PUT /api/user/profile` - Update user profile
  - `POST /api/user/avatar` - Upload avatar image
  - `PUT /api/user/password` - Change password
  - `DELETE /api/user/account` - Request account deletion

#### Event Organizer Profile
- **Implementation**: Public-facing organizer profile for events
- **Technical Decision**: Separate public profile from user account details
- **Component Structure**:
  ```typescript
  <OrganizerProfileManager>
    <OrganizerDetails
      profile={organizerProfile}
      onUpdate={handleUpdateProfile}
    />
    <EventShowcase
      events={pastEvents}
      onReorder={handleReorderEvents}
    />
    <TestimonialsManager
      testimonials={testimonials}
      onAdd={handleAddTestimonial}
      onRemove={handleRemoveTestimonial}
    />
  </OrganizerProfileManager>
  ```
- **API Integration**:
  - `GET /api/organizer/:id` - Fetch public organizer profile
  - `PUT /api/organizer` - Update organizer profile
  - `GET /api/organizer/events` - Fetch showcased events
  - `PUT /api/organizer/events/order` - Reorder showcased events

## Technical Decisions

### Authentication Architecture
- **Supabase Auth**: For user authentication and session management
- **JWT Tokens**: For secure authentication between client and server
- **HTTP-only Cookies**: For secure token storage
- **Server-side Sessions**: For additional security and control

### Database Schema
- **User Table**: Core user information
  - id, email, password_hash, created_at, last_login, status
- **Profiles Table**: Extended user information
  - user_id, display_name, bio, website, avatar_url, social_links
- **User_Roles Table**: Role assignments
  - user_id, role_id, assigned_at, assigned_by
- **Roles Table**: Role definitions
  - id, name, description, permissions, is_system
- **User_Preferences Table**: User settings
  - user_id, theme, notification_settings, display_settings, feature_preferences

### Security Implementation
- **Password Policies**: Enforce strong passwords
- **Rate Limiting**: Prevent brute force attacks
- **MFA Support**: Optional two-factor authentication
- **Account Recovery**: Secure password reset flow
- **Session Invalidation**: Ability to invalidate sessions across devices

### Permission Model
- **Resource-based Permissions**: `[resource].[action]` format
  - Example: `events.create`, `events.delete`, `users.manage`
- **Role-based Access**: Assign permissions to roles, roles to users
- **Default Roles**:
  - Guest: Limited access to public resources
  - User: Standard user capabilities
  - Event Organizer: Enhanced event management
  - Admin: Full system access

## Implementation Priorities

### Phase 2.7: Authentication Foundation
1. Supabase Auth integration
2. Login and registration flows
3. Session management
4. Password reset functionality

### Phase 2.8: User Profile System
1. Basic profile management
2. Avatar upload and management
3. User preferences system
4. Email verification

### Phase 2.9: Access Control
1. Role-based permission system
2. Permission UI components
3. Admin user management
4. Organizer profile features

## Best Practices

### Authentication Security
- Never store plaintext passwords
- Implement proper password hashing with Bcrypt
- Use HTTPS for all authentication traffic
- Implement proper CSRF protection
- Follow OWASP authentication best practices

### User Experience
- Clear error messages for authentication issues
- Streamlined registration process
- Email verification without excessive friction
- Intuitive password recovery
- Session persistence based on user preference

### Privacy and Compliance
- Clear data collection and usage policies
- GDPR-compliant user data management
- Data minimization principles
- User data export functionality
- Account deletion capability

### Testing Strategy
- Unit tests for authentication flows
- Integration tests for role-based access
- Security testing for authentication endpoints
- End-to-end tests for user journeys

## Lessons Learned

- **Authentication Complexity**: Using a managed service like Supabase simplifies security implementation
- **Permission Flexibility**: Design permission systems for future extensibility
- **Profile Customization**: Balance user personalization with implementation complexity
- **Testing Authentication**: Comprehensive testing of edge cases prevents security gaps
- **User Feedback**: Clear messaging for authentication errors significantly improves user experience

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/login               - User login
POST   /api/auth/register            - User registration
POST   /api/auth/logout              - User logout
POST   /api/auth/password-reset      - Request password reset
POST   /api/auth/password-reset/confirm - Confirm password reset
GET    /api/auth/session             - Get current session
DELETE /api/auth/session/:id         - Invalidate specific session
```

### User Endpoints
```
GET    /api/user                     - Get current user details
PUT    /api/user                     - Update user details
GET    /api/user/profile             - Get user profile
PUT    /api/user/profile             - Update user profile
POST   /api/user/avatar              - Upload avatar
PUT    /api/user/password            - Change password
DELETE /api/user/account             - Delete account
```

### Preferences Endpoints
```
GET    /api/user/preferences         - Get user preferences
PUT    /api/user/preferences         - Update user preferences
GET    /api/user/notifications/settings - Get notification settings
PUT    /api/user/notifications/settings - Update notification settings
```

### Role Management Endpoints
```
GET    /api/roles                    - Get all roles
POST   /api/roles                    - Create new role
GET    /api/roles/:id                - Get specific role
PUT    /api/roles/:id                - Update role
DELETE /api/roles/:id                - Delete role
GET    /api/permissions              - Get all permissions
GET    /api/user/permissions         - Get current user's permissions
PUT    /api/users/:id/roles          - Assign role to user
```

## References

- [Supabase Auth Documentation](https://supabase.io/docs/reference/javascript/auth)
- [OWASP Authentication Best Practices](https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/04-Authentication_Testing/01-Testing_for_Credentials_Transported_over_an_Encrypted_Channel)
- [GDPR Compliance](https://gdpr.eu/what-is-gdpr/)
- [Features Documentation](/docs/features.md)
- [Project Requirements](/docs/project-requirements.md) 