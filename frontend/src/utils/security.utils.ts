/**
 * Secure Storage Utilities
 * Client-side encryption and secure storage for sensitive data
 */

const STORAGE_PREFIX = 'speedlink_';

/**
 * Secure storage wrapper for localStorage with encryption
 */
class SecureStorage {
  /**
   * Store data securely
   */
  setItem(key: string, value: string): void {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, encrypted);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  }

  /**
   * Retrieve data securely
   */
  getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  }

  /**
   * Remove item
   */
  removeItem(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }

  /**
   * Clear all SpeedLink storage
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Simple encryption (Base64 encoding with obfuscation)
   * Note: This is not cryptographically secure, just basic obfuscation
   * Real security comes from HTTPS and httpOnly cookies
   */
  private encrypt(value: string): string {
    const encoded = btoa(value);
    const obfuscated = encoded.split('').reverse().join('');
    return obfuscated;
  }

  /**
   * Simple decryption
   */
  private decrypt(value: string): string {
    const deobfuscated = value.split('').reverse().join('');
    const decoded = atob(deobfuscated);
    return decoded;
  }
}

export const secureStorage = new SecureStorage();

/**
 * Token storage helpers
 */
export const TokenStorage = {
  setAccessToken(token: string): void {
    secureStorage.setItem('access_token', token);
  },

  getAccessToken(): string | null {
    return secureStorage.getItem('access_token');
  },

  setRefreshToken(token: string): void {
    secureStorage.setItem('refresh_token', token);
  },

  getRefreshToken(): string | null {
    return secureStorage.getItem('refresh_token');
  },

  setTokenExpiry(expiry: number): void {
    secureStorage.setItem('token_expiry', expiry.toString());
  },

  getTokenExpiry(): number | null {
    const expiry = secureStorage.getItem('token_expiry');
    return expiry ? parseInt(expiry, 10) : null;
  },

  setUserProfile(profile: object): void {
    secureStorage.setItem('user_profile', JSON.stringify(profile));
  },

  getUserProfile(): object | null {
    const profile = secureStorage.getItem('user_profile');
    return profile ? JSON.parse(profile) : null;
  },

  clearAll(): void {
    secureStorage.removeItem('access_token');
    secureStorage.removeItem('refresh_token');
    secureStorage.removeItem('token_expiry');
    secureStorage.removeItem('user_profile');
  },
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiry: number | null): boolean {
  if (!expiry) return true;
  return Date.now() >= expiry;
}

/**
 * Calculate token expiry timestamp
 */
export function calculateTokenExpiry(expiresIn: number): number {
  return Date.now() + expiresIn * 1000;
}

/**
 * Password strength calculator
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  feedback: string[];
  meetsMinimum: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const variety = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (!hasLower) feedback.push('Add lowercase letters');
  if (!hasUpper) feedback.push('Add uppercase letters');
  if (!hasNumber) feedback.push('Add numbers');
  if (!hasSpecial) feedback.push('Add special characters');

  if (variety >= 3) score += 1;
  if (variety === 4) score += 1;

  // Common patterns
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeated characters');
  }

  if (/^(password|123456|qwerty)/i.test(password)) {
    feedback.push('Password is too common');
    score = Math.min(score, 1);
  }

  const meetsMinimum = password.length >= 8 && hasLower && hasUpper && hasNumber;

  const labels: ('Weak' | 'Fair' | 'Good' | 'Strong')[] = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const label = labels[score] || 'Weak';

  return {
    score,
    label,
    feedback,
    meetsMinimum,
  };
}

/**
 * Generate CSRF token (for future use)
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Debounce function for input validation
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
