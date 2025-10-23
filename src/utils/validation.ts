/**
 * Input Validation and Sanitization Utilities
 * Provides comprehensive validation for API inputs and user data
 */

import { z, ZodIssue } from 'zod';

// Base validation schemas
export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const SearchSchema = z.object({
  search: z.string().min(1).max(100).optional(),
});

// Animal validation schemas
export const AnimalLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(1).max(200),
  farmSection: z.string().min(1).max(50),
});

export const AnimalParentageSchema = z.object({
  sireId: ObjectIdSchema.optional(),
  damId: ObjectIdSchema.optional(),
  sireName: z.string().min(1).max(100).optional(),
  damName: z.string().min(1).max(100).optional(),
});

export const AnimalPurchaseInfoSchema = z.object({
  purchaseDate: z.coerce.date(),
  purchasePrice: z.number().positive(),
  currency: z.string().length(3),
  supplier: z.string().min(1).max(100),
});

export const AnimalHealthVaccinationSchema = z.object({
  vaccine: z.string().min(1).max(100),
  date: z.coerce.date(),
  nextDue: z.coerce.date(),
  veterinarian: z.string().min(1).max(100),
});

export const AnimalHealthDiseaseSchema = z.object({
  disease: z.string().min(1).max(100),
  diagnosisDate: z.coerce.date(),
  treatment: z.string().min(1).max(200),
  status: z.enum(['active', 'recovered', 'chronic']),
});

export const AnimalHealthSchema = z.object({
  overallCondition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']),
  lastCheckup: z.coerce.date(),
  nextCheckup: z.coerce.date(),
  vaccinations: z.array(AnimalHealthVaccinationSchema).default([]),
  diseases: z.array(AnimalHealthDiseaseSchema).default([]),
});

export const AnimalBreedingSchema = z.object({
  isBreedingStock: z.boolean().default(false),
  fertilityStatus: z.enum(['fertile', 'subfertile', 'infertile']),
  lastBreedingDate: z.coerce.date().optional(),
  expectedCalvingDate: z.coerce.date().optional(),
  offspring: z.array(z.string()).default([]),
});

export const AnimalNutritionSchema = z.object({
  dailyFeedIntake: z.number().positive(),
  feedType: z.string().min(1).max(100),
  supplements: z.array(z.string()).default([]),
  feedingSchedule: z.string().min(1).max(200),
});

export const AnimalProductivitySchema = z.object({
  milkProduction: z.number().positive().optional(),
  eggProduction: z.number().positive().optional(),
  weightGain: z.number(),
  lastMeasurement: z.coerce.date(),
});

export const AnimalImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().min(1).max(200),
  uploadedAt: z.coerce.date(),
});

export const AnimalAlertSchema = z.object({
  type: z.enum(['health', 'breeding', 'nutrition', 'maintenance']),
  message: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  createdAt: z.coerce.date(),
  resolved: z.boolean().default(false),
  resolvedAt: z.coerce.date().optional(),
});

export const CreateAnimalSchema = z.object({
  species: z.enum(['cattle', 'sheep', 'goats', 'poultry', 'pigs', 'other']),
  breed: z.string().min(1).max(100),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['male', 'female']),
  color: z.string().min(1).max(50),
  weight: z.number().positive(),
  height: z.number().positive().optional(),
  status: z.enum(['active', 'sold', 'deceased', 'quarantined', 'breeding']).default('active'),
  location: AnimalLocationSchema,
  parentage: AnimalParentageSchema.optional(),
  purchaseInfo: AnimalPurchaseInfoSchema.optional(),
  health: AnimalHealthSchema,
  breeding: AnimalBreedingSchema,
  nutrition: AnimalNutritionSchema,
  productivity: AnimalProductivitySchema,
  images: z.array(AnimalImageSchema).default([]),
  notes: z.string().max(1000).default(''),
  alerts: z.array(AnimalAlertSchema).default([]),
});

// Health record validation schemas
export const HealthMedicationSchema = z.object({
  name: z.string().min(1).max(100),
  dosage: z.string().min(1).max(50),
  frequency: z.string().min(1).max(50),
  duration: z.number().int().positive(),
  instructions: z.string().min(1).max(200),
});

export const HealthVaccinationSchema = z.object({
  vaccine: z.string().min(1).max(100),
  batchNumber: z.string().min(1).max(50),
  manufacturer: z.string().min(1).max(100),
  nextDueDate: z.coerce.date(),
  notes: z.string().max(200).default(''),
});

export const HealthTestSchema = z.object({
  testType: z.string().min(1).max(100),
  result: z.string().min(1).max(200),
  normalRange: z.string().min(1).max(100),
  notes: z.string().max(200).default(''),
});

export const HealthCostSchema = z.object({
  consultationFee: z.number().min(0),
  medicationCost: z.number().min(0),
  testCost: z.number().min(0),
  totalCost: z.number().min(0),
  currency: z.string().length(3),
});

export const CreateHealthRecordSchema = z.object({
  animalId: ObjectIdSchema,
  animalRfid: z.string().min(1).max(50),
  recordType: z.enum(['checkup', 'vaccination', 'treatment', 'surgery', 'emergency', 'quarantine']),
  date: z.coerce.date(),
  veterinarian: z.string().min(1).max(100),
  veterinarianId: ObjectIdSchema.optional(),
  diagnosis: z.string().min(1).max(200),
  symptoms: z.array(z.string().min(1).max(100)).min(1),
  treatment: z.string().min(1).max(300),
  medications: z.array(HealthMedicationSchema).default([]),
  vaccinations: z.array(HealthVaccinationSchema).default([]),
  tests: z.array(HealthTestSchema).default([]),
  followUp: z.object({
    required: z.boolean().default(false),
    date: z.coerce.date().optional(),
    instructions: z.string().max(200).default(''),
  }),
  cost: HealthCostSchema,
  notes: z.string().max(500).default(''),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['active', 'resolved', 'chronic', 'monitoring']).default('active'),
});

// Financial record validation schema
export const CreateFinancialRecordSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).max(50),
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1).max(200),
  date: z.coerce.date(),
});

// Feed record validation schema
export const CreateFeedRecordSchema = z.object({
  feedName: z.string().min(1).max(100),
  type: z.enum(['concentrate', 'roughage', 'supplement', 'silage']),
  currentStock: z.number().min(0),
  unit: z.string().min(1).max(20),
  minStock: z.number().min(0),
  costPerUnit: z.number().min(0),
  supplier: z.string().min(1).max(100),
  expiryDate: z.coerce.date(),
});

// Breeding record validation schema
export const CreateBreedingRecordSchema = z.object({
  programName: z.string().min(1).max(100),
  species: z.string().min(1).max(50),
  breed: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']),
  totalAnimals: z.number().int().positive(),
  expectedOffspring: z.number().int().min(0),
  actualOffspring: z.number().int().min(0),
  successRate: z.number().min(0).max(100),
});

// RFID record validation schema
export const CreateRFIDRecordSchema = z.object({
  tagId: z.string().min(1).max(50),
  animalId: ObjectIdSchema,
  animalName: z.string().min(1).max(100),
  species: z.string().min(1).max(50),
  breed: z.string().min(1).max(100),
  tagType: z.enum(['ear_tag', 'bolus', 'collar', 'leg_band']),
  batteryLevel: z.number().min(0).max(100),
  signalStrength: z.enum(['excellent', 'good', 'fair', 'poor']),
  status: z.enum(['active', 'maintenance', 'offline', 'error']),
  lastScan: z.coerce.date(),
});

// Task record validation schema
export const TaskAssigneeSchema = z.object({
  _id: ObjectIdSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export const TaskAnimalSchema = z.object({
  _id: ObjectIdSchema,
  name: z.string().min(1).max(100),
  species: z.string().min(1).max(50),
});

export const TaskKPISchema = z.object({
  efficiency: z.number().min(0).max(100).optional(),
  quality: z.number().min(0).max(100).optional(),
  timeliness: z.number().min(0).max(100).optional(),
  safety: z.number().min(0).max(100).optional(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  assignedTo: TaskAssigneeSchema,
  assignedBy: TaskAssigneeSchema,
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).default('pending'),
  dueDate: z.coerce.date(),
  completedDate: z.coerce.date().optional(),
  category: z.enum(['feeding', 'health', 'maintenance', 'breeding', 'financial', 'general']),
  progress: z.number().min(0).max(100).default(0),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  location: z.string().max(100).optional(),
  animalId: TaskAnimalSchema.optional(),
  kpi: TaskKPISchema.optional(),
});

// Input sanitization functions
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export function sanitizeSearchTerm(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>$(){}[\]\\]/g, '') // Remove special characters that could be used for injection
    .slice(0, 100); // Limit length
}

export function sanitizeNumber(input: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const num = Number(input);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

// Validation helper functions
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true; data: T
} | {
  success: false; errors: z.ZodError
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

export function validatePagination(params: unknown): {
  success: true; data: { page: number; limit: number }
} | {
  success: false; errors: string[]
} {
  const result = validateWithSchema(PaginationSchema, params);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.errors.issues.map((err: ZodIssue) => `${err.path.join('.')}: ${err.message}`)
    };
  }
}

// Rate limiting helper
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });

    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes