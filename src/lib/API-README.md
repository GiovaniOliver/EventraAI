# API Authentication System

This document explains the API authentication system implemented in the EventraAI application.

## Overview

The API authentication system provides a unified way to handle authenticated requests to backend API endpoints. It ensures that:

1. All API requests include proper authentication headers
2. Authentication tokens are automatically refreshed when needed
3. Users are redirected to login when authentication fails
4. Error handling is consistent across all API requests

## Key Components

### 1. `api.ts`

The core utility that handles API requests with consistent error handling and authentication:

- **Request Methods**: `get`, `post`, `put`, `patch`, `delete`
- **Authentication**: Automatically includes auth token from Supabase
- **Error Handling**: Consistent handling of API errors
- **Token Refresh**: Detects 401 errors and attempts to refresh authentication

### 2. `api-client.ts`

High-level API client that provides domain-specific methods for interacting with different parts of the API:

- **Resource-based Organization**: Methods organized by resource (events, tasks, users, etc.)
- **Type Safety**: TypeScript interfaces for request/response types
- **Simplified Usage**: Easy-to-use methods that abstract away HTTP details
- **Consistent Patterns**: Standardized approach to API interactions

### 3. Health Check Endpoint

API health check endpoint at `/api/health` for monitoring the API status:

- **API Status**: Verifies API is running
- **Authentication Status**: Checks if authentication is working
- **Environment Info**: Validates environment variables

## Authentication Flow

1. **Request Preparation**:
   - API client prepares a request to a protected endpoint
   - Auth token is automatically retrieved from Supabase and included in the `Authorization` header

2. **Request Execution**:
   - Request is sent to the API endpoint
   - Server validates the token via middleware

3. **Error Handling**:
   - If a 401 Unauthorized error occurs, the client attempts to refresh the session
   - If refresh succeeds, the original request is retried with the new token
   - If refresh fails, the user is redirected to the login page

4. **Session Management**:
   - Supabase handles the underlying session management
   - The API client manages token inclusion and refresh logic

## Usage Examples

### Basic Usage with `api.ts`

```typescript
import { api } from '@/lib/api';

// GET request
const fetchData = async () => {
  try {
    const data = await api.get('/api/events');
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// POST request with body
const createItem = async (data) => {
  try {
    const response = await api.post('/api/events', data);
    return response;
  } catch (error) {
    console.error('Error creating event:', error);
  }
};
```

### Using Domain-Specific Client

```typescript
import { apiClient } from '@/lib/api-client';

// Fetch events with filtering and pagination
const fetchEvents = async () => {
  try {
    const { data, total } = await apiClient.events.getAll({
      page: 1,
      pageSize: 10,
      status: 'active',
      search: 'conference'
    });
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Create a new task
const createTask = async (eventId, taskData) => {
  try {
    const task = await apiClient.tasks.create(eventId, taskData);
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
  }
};
```

## Security Considerations

1. **Token Storage**: Auth tokens are managed by Supabase and stored securely
2. **HTTPS Only**: All API requests should be made over HTTPS
3. **Token Expiration**: Tokens have limited lifetime and are refreshed as needed
4. **Error Handling**: Authentication errors don't expose sensitive information
5. **Middleware Protection**: Server-side middleware validates all requests

## Troubleshooting

If you encounter authentication issues:

1. Check browser console for authentication error messages
2. Verify that Supabase is running and accessible
3. Confirm environment variables are properly set
4. Ensure the user is signed in before making authenticated requests
5. Check the health endpoint at `/api/health` for API status

## Related Files

- `src/lib/api.ts` - Core API utility
- `src/lib/api-client.ts` - Domain-specific API client
- `src/app/api/health/route.ts` - Health check endpoint
- `src/middleware.ts` - Authentication middleware
- `src/lib/supabase.ts` - Supabase client configuration 