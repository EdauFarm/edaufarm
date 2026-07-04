import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Check if user has required role on the server side
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect('/dashboard'); // Redirect to dashboard if role doesn't match
  }

  return session;
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return requireRole(['admin']);
}

/**
 * Client-side role check utility
 */
export function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: string | undefined): boolean {
  return hasRole(userRole, ['admin']);
}

export function isUser(userRole: string | undefined): boolean {
  return hasRole(userRole, ['user']);
}
