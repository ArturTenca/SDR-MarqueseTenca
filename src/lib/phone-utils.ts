/**
 * Phone number masking utilities for data privacy
 * LGPD/GDPR compliance - mask sensitive PII data
 */

/**
 * Masks a phone number showing only first 4 and last 2 digits
 * Example: 5511999999001 -> 5511******01
 */
export function maskPhoneNumber(phone: string | null): string {
  if (!phone) return "-";
  
  const clean = phone.replace(/\D/g, "");
  
  if (clean.length < 6) {
    return clean;
  }
  
  // Show first 4 digits (country + area code) and last 2 digits
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-2);
  const maskedMiddle = "*".repeat(clean.length - 6);
  
  return `${prefix}${maskedMiddle}${suffix}`;
}

/**
 * Formats a masked phone number with Brazilian format
 * Example: 5511******01 -> +55 (11) ****-**01
 */
export function formatMaskedPhone(phone: string | null): string {
  if (!phone) return "-";
  
  const masked = maskPhoneNumber(phone);
  const clean = masked.replace(/\D/g, "").replace(/\*/g, "X");
  
  // Brazilian format: +55 (11) XXXXX-XX01
  if (clean.length >= 13) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  
  return masked;
}

/**
 * Gets the unmasked phone number - USE WITH CAUTION
 * Only for authorized operations (SMS sending, etc)
 * Should be logged for audit purposes
 */
export function getUnmaskedPhone(phone: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/\D/g, "");
}

/**
 * Checks if user has permission to view unmasked data
 * In production, this should check actual user roles/permissions
 */
export function canViewUnmaskedData(userRole?: string): boolean {
  // TODO: Implement proper role-based access control
  return userRole === 'admin' || userRole === 'service_role';
}

