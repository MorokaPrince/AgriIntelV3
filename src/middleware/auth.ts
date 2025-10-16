import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Role hierarchy for permissions
const ROLE_HIERARCHY = {
  admin: 100,
  manager: 80,
  veterinarian: 60,
  worker: 40,
  viewer: 20,
} as const;

const PERMISSIONS = {
  // User management
  'users:read': ['admin', 'manager'] as const,
  'users:write': ['admin', 'manager'] as const,
  'users:delete': ['admin'] as const,

  // Animal management
  'animals:read': ['admin', 'manager', 'veterinarian', 'worker', 'viewer'] as const,
  'animals:write': ['admin', 'manager', 'veterinarian', 'worker'] as const,
  'animals:delete': ['admin', 'manager'] as const,

  // Health records
  'health:read': ['admin', 'manager', 'veterinarian', 'worker', 'viewer'] as const,
  'health:write': ['admin', 'manager', 'veterinarian'] as const,
  'health:delete': ['admin', 'manager'] as const,

  // Financial records
  'financial:read': ['admin', 'manager', 'viewer'] as const,
  'financial:write': ['admin', 'manager'] as const,
  'financial:delete': ['admin'] as const,

  // Reports and analytics
  'reports:read': ['admin', 'manager', 'veterinarian', 'viewer'] as const,
  'reports:export': ['admin', 'manager'] as const,

  // System settings
  'settings:read': ['admin', 'manager'] as const,
  'settings:write': ['admin'] as const,
} as const;

type Permission = keyof typeof PERMISSIONS;
type UserRole = keyof typeof ROLE_HIERARCHY;

export function hasPermission(userRole: string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return (allowedRoles as readonly string[]).includes(userRole);
}

export function hasRoleHierarchy(userRole: string, requiredRole: UserRole): boolean {
  const userRoleLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
  return userRoleLevel >= requiredRoleLevel;
}

export async function requireAuth(request: NextRequest): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return session;
}

export async function requirePermission(request: NextRequest, permission: Permission): Promise<Session | NextResponse> {
  const session = await requireAuth(request);

  if (!session || 'error' in session) {
    return session;
  }

  const sessionObj = session as Session;
  if (!hasPermission(sessionObj.user.role, permission)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return session;
}

export async function requireRole(request: NextRequest, requiredRole: UserRole): Promise<Session | NextResponse> {
  const session = await requireAuth(request);

  if (!session || 'error' in session) {
    return session;
  }

  const sessionObj = session as Session;
  if (!hasRoleHierarchy(sessionObj.user.role, requiredRole)) {
    return NextResponse.json(
      { error: 'Insufficient role level' },
      { status: 403 }
    );
  }

  return session;
}

// Middleware function for API routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, session: Session | null) => Promise<NextResponse>,
  options?: {
    requiredPermission?: Permission;
    requiredRole?: UserRole;
    allowPublic?: boolean;
  }
): Promise<NextResponse> {
  try {
    // Check if authentication is required
    if (!options?.allowPublic) {
      const session = await requireAuth(request);

      if (!session || 'error' in session) {
        return session as NextResponse;
      }

      const sessionObj = session as Session;

      // Check role requirement
      if (options?.requiredRole) {
        const roleCheck = await requireRole(request, options.requiredRole);
        if (!roleCheck || 'error' in roleCheck) {
          return roleCheck as NextResponse;
        }
      }

      // Check permission requirement
      if (options?.requiredPermission) {
        const permissionCheck = await requirePermission(request, options.requiredPermission);
        if (!permissionCheck || 'error' in permissionCheck) {
          return permissionCheck as NextResponse;
        }
      }

      return await handler(request, sessionObj);
    }

    return await handler(request, null);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get user permissions
export function getUserPermissions(userRole: string): Permission[] {
  return Object.keys(PERMISSIONS).filter(permission =>
    hasPermission(userRole, permission as Permission)
  ) as Permission[];
}

// Helper function to check if user can access resource
export function canAccessResource(
  userRole: string,
  resourceType: 'animal' | 'health' | 'financial' | 'user',
  action: 'read' | 'write' | 'delete'
): boolean {
  const permissionMap = {
    animal: {
      read: 'animals:read',
      write: 'animals:write',
      delete: 'animals:delete',
    },
    health: {
      read: 'health:read',
      write: 'health:write',
      delete: 'health:delete',
    },
    financial: {
      read: 'financial:read',
      write: 'financial:write',
      delete: 'financial:delete',
    },
    user: {
      read: 'users:read',
      write: 'users:write',
      delete: 'users:delete',
    },
  };

  const permission = permissionMap[resourceType][action];
  return hasPermission(userRole, permission as Permission);
}