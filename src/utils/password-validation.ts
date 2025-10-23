/**
 * Password Strength Validation Utilities
 * Provides comprehensive password validation and strength checking
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  rule: string;
  met: boolean;
  description: string;
}

export interface PasswordStrengthConfig {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventSequential: boolean;
}

const DEFAULT_CONFIG: PasswordStrengthConfig = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventSequential: true,
};

// Common weak passwords to reject
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
  'password1', 'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  'password12', 'password1234', 'password12345', 'password123456',
  'password123456789', 'password1234567890', 'passw0rd', 'p@ssword',
  'p@ssw0rd', 'Password', 'PASSWORD', 'Password1', 'Password123'
]);

// Sequential patterns to detect
const SEQUENTIAL_PATTERNS = [
  'abcdefghijklmnopqrstuvwxyz',
  'qwertyuiopasdfghjklzxcvbnm',
  '1234567890',
  '0987654321',
  'zyxwvutsrqponmlkjihgfedcba'
];

/**
 * Validates password strength and provides detailed feedback
 */
export function validatePasswordStrength(
  password: string,
  config: PasswordStrengthConfig = DEFAULT_CONFIG
): PasswordValidationResult {
  const requirements: PasswordRequirement[] = [];
  const feedback: string[] = [];
  let score = 0;

  // Check length requirements
  const lengthReq = {
    rule: 'length',
    met: password.length >= config.minLength && password.length <= config.maxLength,
    description: `Password must be between ${config.minLength} and ${config.maxLength} characters`
  };
  requirements.push(lengthReq);

  if (lengthReq.met) {
    if (password.length >= 12) score += 1;
    else if (password.length >= 10) score += 0.5;
  } else {
    feedback.push(lengthReq.description);
  }

  // Check uppercase requirement
  const uppercaseRegex = /[A-Z]/;
  const uppercaseReq = {
    rule: 'uppercase',
    met: !config.requireUppercase || uppercaseRegex.test(password),
    description: 'Password must contain at least one uppercase letter'
  };
  requirements.push(uppercaseReq);

  if (uppercaseReq.met) {
    const uppercaseCount = (password.match(uppercaseRegex) || []).length;
    if (uppercaseCount >= 2) score += 1;
    else score += 0.5;
  } else if (config.requireUppercase) {
    feedback.push(uppercaseReq.description);
  }

  // Check lowercase requirement
  const lowercaseRegex = /[a-z]/;
  const lowercaseReq = {
    rule: 'lowercase',
    met: !config.requireLowercase || lowercaseRegex.test(password),
    description: 'Password must contain at least one lowercase letter'
  };
  requirements.push(lowercaseReq);

  if (lowercaseReq.met) {
    const lowercaseCount = (password.match(lowercaseRegex) || []).length;
    if (lowercaseCount >= 2) score += 1;
    else score += 0.5;
  } else if (config.requireLowercase) {
    feedback.push(lowercaseReq.description);
  }

  // Check numbers requirement
  const numbersRegex = /[0-9]/;
  const numbersReq = {
    rule: 'numbers',
    met: !config.requireNumbers || numbersRegex.test(password),
    description: 'Password must contain at least one number'
  };
  requirements.push(numbersReq);

  if (numbersReq.met) {
    const numbersCount = (password.match(numbersRegex) || []).length;
    if (numbersCount >= 2) score += 1;
    else score += 0.5;
  } else if (config.requireNumbers) {
    feedback.push(numbersReq.description);
  }

  // Check special characters requirement
  const specialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  const specialReq = {
    rule: 'special',
    met: !config.requireSpecialChars || specialRegex.test(password),
    description: 'Password must contain at least one special character'
  };
  requirements.push(specialReq);

  if (specialReq.met) {
    const specialCount = (password.match(specialRegex) || []).length;
    if (specialCount >= 2) score += 1;
    else score += 0.5;
  } else if (config.requireSpecialChars) {
    feedback.push(specialReq.description);
  }

  // Check for common passwords
  const isCommonPassword = config.preventCommonPasswords &&
    COMMON_PASSWORDS.has(password.toLowerCase());

  const commonReq = {
    rule: 'common',
    met: !isCommonPassword,
    description: 'Password must not be a commonly used password'
  };
  requirements.push(commonReq);

  if (isCommonPassword) {
    feedback.push('This password is too common. Please choose a more unique password.');
  } else {
    score += 0.5;
  }

  // Check for sequential patterns
  const hasSequential = config.preventSequential &&
    SEQUENTIAL_PATTERNS.some(pattern =>
      pattern.includes(password.toLowerCase()) ||
      password.toLowerCase().includes(pattern.slice(0, 4))
    );

  const sequentialReq = {
    rule: 'sequential',
    met: !hasSequential,
    description: 'Password must not contain sequential characters (e.g., "abc", "123")'
  };
  requirements.push(sequentialReq);

  if (hasSequential) {
    feedback.push('Password must not contain sequential characters.');
  } else {
    score += 0.5;
  }

  // Bonus points for complexity
  if (password.length >= 16) score += 0.5;
  if ((password.match(/[A-Z]/g) || []).length >= 3) score += 0.5;
  if ((password.match(/[0-9]/g) || []).length >= 3) score += 0.5;
  if ((password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2) score += 0.5;

  // Penalty for repeated characters
  const repeatedChars = /(.)\1{2,}/.test(password);
  if (repeatedChars) {
    score -= 0.5;
    feedback.push('Avoid repeating the same character multiple times.');
  }

  // Penalty for only numbers or only letters
  const onlyNumbers = /^\d+$/.test(password);
  const onlyLetters = /^[a-zA-Z]+$/.test(password);

  if (onlyNumbers) {
    score -= 1;
    feedback.push('Password should not contain only numbers.');
  }

  if (onlyLetters) {
    score -= 1;
    feedback.push('Password should contain numbers and/or special characters.');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(4, score));

  return {
    isValid: requirements.every(req => req.met) && feedback.length === 0,
    score,
    feedback,
    requirements
  };
}

/**
 * Generates a password strength indicator
 */
export function getPasswordStrengthIndicator(score: number): {
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  label: string;
  color: string;
} {
  if (score < 1) {
    return { level: 'very-weak', label: 'Very Weak', color: '#ef4444' };
  } else if (score < 2) {
    return { level: 'weak', label: 'Weak', color: '#f97316' };
  } else if (score < 3) {
    return { level: 'fair', label: 'Fair', color: '#eab308' };
  } else if (score < 4) {
    return { level: 'good', label: 'Good', color: '#22c55e' };
  } else {
    return { level: 'strong', label: 'Strong', color: '#16a34a' };
  }
}

/**
 * Validates password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): { isValid: boolean; error?: string } {
  if (password !== confirmation) {
    return {
      isValid: false,
      error: 'Passwords do not match'
    };
  }

  return { isValid: true };
}

/**
 * Generates password requirements text for UI display
 */
export function generatePasswordRequirementsText(config: PasswordStrengthConfig = DEFAULT_CONFIG): string {
  const requirements = [];

  requirements.push(`Between ${config.minLength} and ${config.maxLength} characters`);

  if (config.requireUppercase) {
    requirements.push('At least one uppercase letter');
  }

  if (config.requireLowercase) {
    requirements.push('At least one lowercase letter');
  }

  if (config.requireNumbers) {
    requirements.push('At least one number');
  }

  if (config.requireSpecialChars) {
    requirements.push('At least one special character');
  }

  if (config.preventCommonPasswords) {
    requirements.push('Not a common password');
  }

  if (config.preventSequential) {
    requirements.push('No sequential characters');
  }

  return requirements.join(', ');
}