/**
 * Helper to check if an email or role is considered an Administrator.
 * Reads comma-separated emails from environment variables (ADMIN_EMAILS or NEXT_PUBLIC_ADMIN_EMAILS).
 */

export function getAdminEmails(): string[] {
  const adminEmailsEnv =
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    '';

  return adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminList = getAdminEmails();
  return adminList.includes(email.trim().toLowerCase());
}

export function isUserAdmin(user?: { role?: string | null; email?: string | null } | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return isAdminEmail(user.email);
}
