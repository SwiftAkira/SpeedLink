/**
 * Password Validation Utilities
 * Advanced password security checks and strength calculation
 */

// Common passwords list (top 100 most common passwords)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
  'password1', '123456789', '12345', 'password123', '1234', 'welcome123',
]);

export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  entropy: number;
  isCommon: boolean;
  meetsMinimum: boolean;
}

/**
 * Calculate password entropy (randomness)
 */
export function calculateEntropy(password: string): number {
  const charSetSize = getCharacterSetSize(password);
  return Math.log2(Math.pow(charSetSize, password.length));
}

/**
 * Get character set size based on password composition
 */
function getCharacterSetSize(password: string): number {
  let size = 0;
  
  if (/[a-z]/.test(password)) size += 26; // lowercase
  if (/[A-Z]/.test(password)) size += 26; // uppercase
  if (/[0-9]/.test(password)) size += 10; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) size += 32; // special chars
  
  return size;
}

/**
 * Check if password is in common password list
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else if (password.length >= 8) {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  // Character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  const varietyCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (!hasLowercase) {
    feedback.push('Include lowercase letters (a-z)');
  }
  
  if (!hasUppercase) {
    feedback.push('Include uppercase letters (A-Z)');
  }
  
  if (!hasNumber) {
    feedback.push('Include numbers (0-9)');
  }
  
  if (!hasSpecial) {
    feedback.push('Include special characters (!@#$%^&*)');
  }
  
  if (varietyCount >= 3) {
    score += 1;
  }
  
  if (varietyCount === 4) {
    score += 1;
  }
  
  // Common password check
  const isCommon = isCommonPassword(password);
  if (isCommon) {
    feedback.push('Password is too common');
    score = Math.min(score, 1);
  }
  
  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeated characters');
  }
  
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Avoid sequential characters');
  }
  
  // Calculate entropy
  const entropy = calculateEntropy(password);
  
  // Minimum requirements
  const meetsMinimum = password.length >= 8 && hasLowercase && hasUppercase && hasNumber;
  
  return {
    score: Math.max(0, Math.min(4, score)),
    feedback,
    entropy,
    isCommon,
    meetsMinimum,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Weak';
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check for SQL injection patterns
 */
export function hasSqlInjectionPattern(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(;.*--)/,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must not exceed 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  if (/^[0-9]/.test(username)) {
    return { valid: false, error: 'Username cannot start with a number' };
  }
  
  return { valid: true };
}
