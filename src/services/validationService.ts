/**
 * Validation Service
 * Provides schema validation and data integrity checks
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationService {
  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        value: email,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!password || password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long',
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
      });
    }

    if (!/[0-9]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
      });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character (!@#$%^&*)',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate RFID tag format
   */
  static validateRFIDTag(rfid: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!rfid || rfid.trim().length === 0) {
      errors.push({
        field: 'rfidTag',
        message: 'RFID tag cannot be empty',
      });
    }

    if (rfid.length > 50) {
      errors.push({
        field: 'rfidTag',
        message: 'RFID tag cannot exceed 50 characters',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate animal data
   */
  static validateAnimal(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate RFID
    if (!data.rfidTag || typeof data.rfidTag !== 'string') {
      errors.push({
        field: 'rfidTag',
        message: 'RFID tag is required and must be a string',
      });
    }

    // Validate species
    const validSpecies = ['cattle', 'sheep', 'goats', 'poultry', 'pigs', 'other'];
    if (!data.species || !validSpecies.includes(data.species as string)) {
      errors.push({
        field: 'species',
        message: `Species must be one of: ${validSpecies.join(', ')}`,
      });
    }

    // Validate gender
    const validGenders = ['male', 'female'];
    if (!data.gender || !validGenders.includes(data.gender as string)) {
      errors.push({
        field: 'gender',
        message: 'Gender must be either male or female',
      });
    }

    // Validate weight
    if (typeof data.weight !== 'number' || data.weight <= 0) {
      errors.push({
        field: 'weight',
        message: 'Weight must be a positive number',
      });
    }

    // Validate date of birth
    if (!data.dateOfBirth || !(data.dateOfBirth instanceof Date)) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Date of birth is required and must be a valid date',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate health record data
   */
  static validateHealthRecord(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate record type
    const validTypes = ['checkup', 'vaccination', 'treatment', 'surgery', 'emergency', 'quarantine'];
    if (!data.recordType || !validTypes.includes(data.recordType as string)) {
      errors.push({
        field: 'recordType',
        message: `Record type must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Validate diagnosis
    if (!data.diagnosis || typeof data.diagnosis !== 'string') {
      errors.push({
        field: 'diagnosis',
        message: 'Diagnosis is required and must be a string',
      });
    }

    // Validate treatment
    if (!data.treatment || typeof data.treatment !== 'string') {
      errors.push({
        field: 'treatment',
        message: 'Treatment is required and must be a string',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate financial record data
   */
  static validateFinancialRecord(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate amount
    if (typeof data.amount !== 'number' || data.amount < 0) {
      errors.push({
        field: 'amount',
        message: 'Amount must be a non-negative number',
      });
    }

    // Validate category
    const validCategories = ['income', 'expense', 'investment'];
    if (!data.category || !validCategories.includes(data.category as string)) {
      errors.push({
        field: 'category',
        message: `Category must be one of: ${validCategories.join(', ')}`,
      });
    }

    // Validate description
    if (!data.description || typeof data.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Description is required and must be a string',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

