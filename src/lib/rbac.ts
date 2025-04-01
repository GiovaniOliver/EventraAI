import { createServerClient } from './supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define role hierarchy
export const ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    USER: 'user'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Role hierarchy definition
const ROLE_HIERARCHY: Record<Role, Role[]> = {
    [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER, ROLES.USER],
    [ROLES.EDITOR]: [ROLES.EDITOR, ROLES.VIEWER, ROLES.USER],
    [ROLES.VIEWER]: [ROLES.VIEWER, ROLES.USER],
    [ROLES.USER]: [ROLES.USER]
}

/**
 * Check if a user has the required role
 * @param userId - The user's ID
 * @param requiredRole - The required role
 * @returns Promise<boolean>
 */
export async function hasRole(userId: string, requiredRole: Role): Promise<boolean> {
    const supabase = createServerClient()
    
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
    
    if (!user) return false
    
    return ROLE_HIERARCHY[user.role as Role].includes(requiredRole)
}

/**
 * Middleware to require specific role for API routes
 * @param handler - The API route handler
 * @param requiredRole - The required role
 * @returns Promise<Response>
 */
export function requireRole(requiredRole: Role) {
    return async function middleware(request: NextRequest) {
        const supabase = createServerClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        const hasRequiredRole = await hasRole(session.user.id, requiredRole)
        
        if (!hasRequiredRole) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }
        
        return NextResponse.next()
    }
}

/**
 * Check if a user has admin access
 * @param userId - The user's ID
 * @returns Promise<boolean>
 */
export async function isAdmin(userId: string): Promise<boolean> {
    return hasRole(userId, ROLES.ADMIN)
}

/**
 * Get all roles that a user has access to
 * @param userId - The user's ID
 * @returns Promise<Role[]>
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
    const supabase = createServerClient()
    
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
    
    if (!user) return []
    
    return ROLE_HIERARCHY[user.role as Role]
}

/**
 * Check if a user has permission for a specific action
 * @param userId - The user's ID
 * @param action - The action to check
 * @param resource - The resource being accessed
 * @returns Promise<boolean>
 */
export async function hasPermission(
    userId: string,
    action: 'create' | 'read' | 'update' | 'delete',
    resource: string
): Promise<boolean> {
    const supabase = createServerClient()
    
    // Get user's role
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
    
    if (!user) return false
    
    const userRole = user.role as Role
    
    // Define permission matrix
    const permissions: Record<Role, Record<string, string[]>> = {
        [ROLES.ADMIN]: {
            '*': ['create', 'read', 'update', 'delete'] // Admin can do everything
        },
        [ROLES.EDITOR]: {
            'events': ['create', 'read', 'update'],
            'tasks': ['create', 'read', 'update'],
            'guests': ['create', 'read', 'update'],
            'files': ['create', 'read', 'update']
        },
        [ROLES.VIEWER]: {
            'events': ['read'],
            'tasks': ['read'],
            'guests': ['read'],
            'files': ['read']
        },
        [ROLES.USER]: {
            'events': ['read'],
            'tasks': ['read'],
            'guests': ['read']
        }
    }
    
    // Check if user has permission
    const rolePermissions = permissions[userRole]
    if (!rolePermissions) return false
    
    // Check wildcard permissions first
    if (rolePermissions['*']?.includes(action)) return true
    
    // Check specific resource permissions
    return rolePermissions[resource]?.includes(action) || false
}

/**
 * API route wrapper to require specific permissions
 * @param handler - The API route handler
 * @param action - The required action
 * @param resource - The resource being accessed
 * @returns Promise<Response>
 */
export function requirePermission(action: 'create' | 'read' | 'update' | 'delete', resource: string) {
    return async function middleware(request: NextRequest) {
        const supabase = createServerClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        const hasAccess = await hasPermission(session.user.id, action, resource)
        
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }
        
        return NextResponse.next()
    }
}
