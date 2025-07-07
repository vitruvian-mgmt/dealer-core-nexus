import { z } from "zod";

// Input validation schemas
export const profileValidation = z.object({
  full_name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in name"),
  phone: z.string()
    .optional()
    .refine(val => !val || /^\+?[\d\s\-\(\)]{10,15}$/.test(val), "Invalid phone format"),
  avatar_url: z.string().url().optional().or(z.literal(""))
});

export const customerValidation = z.object({
  first_name: z.string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in first name"),
  last_name: z.string()
    .min(1, "Last name is required") 
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in last name"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string()
    .optional()
    .refine(val => !val || /^\+?[\d\s\-\(\)]{10,15}$/.test(val), "Invalid phone format"),
  address: z.string().max(200, "Address too long").optional(),
  city: z.string().max(100, "City name too long").optional(),
  state: z.string().max(50, "State name too long").optional(),
  zip_code: z.string()
    .optional()
    .refine(val => !val || /^\d{5}(-\d{4})?$/.test(val), "Invalid ZIP code format"),
  notes: z.string().max(1000, "Notes too long").optional()
});

export const vehicleValidation = z.object({
  vin: z.string()
    .length(17, "VIN must be exactly 17 characters")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "Invalid VIN format"),
  make: z.string().max(50, "Make too long").optional(),
  model: z.string().max(50, "Model too long").optional(),
  year: z.number()
    .min(1900, "Year too old")
    .max(new Date().getFullYear() + 2, "Year too far in future")
    .optional(),
  mileage: z.number()
    .min(0, "Mileage cannot be negative")
    .max(999999, "Mileage too high")
    .optional(),
  purchase_price: z.number()
    .min(0, "Price cannot be negative")
    .max(10000000, "Price too high")
    .optional(),
  sale_price: z.number()
    .min(0, "Price cannot be negative")
    .max(10000000, "Price too high")
    .optional()
});

export const leadValidation = z.object({
  source: z.string().max(100, "Source too long").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]),
  estimated_value: z.number()
    .min(0, "Value cannot be negative")
    .max(10000000, "Value too high")
    .optional(),
  notes: z.string().max(2000, "Notes too long").optional()
});

export const serviceJobValidation = z.object({
  service_type: z.string()
    .min(1, "Service type is required")
    .max(100, "Service type too long"),
  description: z.string().max(1000, "Description too long").optional(),
  complaint: z.string().max(1000, "Complaint too long").optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  labor_rate: z.number()
    .min(0, "Rate cannot be negative")
    .max(1000, "Rate too high")
    .optional(),
  labor_hours: z.number()
    .min(0, "Hours cannot be negative")
    .max(100, "Too many hours")
    .optional()
});

// Sanitization functions
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
};

export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ["Invalid input"] };
  }
};