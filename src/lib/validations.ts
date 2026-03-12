import { z } from 'zod';

export const signupSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    confirm_password: z.string(),
    phone: z.string().optional(),
    institute: z.string().min(2, 'Institute name is required').max(200),
    district: z.string().min(1, 'Please select a district'),
    state: z.string().default('Meghalaya'),
}).refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
});

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
});

export const profileCompletionSchema = z.object({
    full_name: z.string().min(2, 'Full name is required'),
    phone: z.string().optional(),
    institute: z.string().min(2, 'Institute is required'),
    district: z.string().min(1, 'District is required'),
    state: z.string().default('Meghalaya'),
    preferred_language: z.string().default('English'),
});

export const metadataSchema = z.object({
    document_title: z.string().min(1, 'Document title is required').max(200),
    source_type: z.string().min(1, 'Source type is required'),
    capture_type: z.string().min(1, 'Capture type is required'),
    language_primary: z.string().default('Khasi'),
    district: z.string().optional(),
    source_institution: z.string().optional(),
    document_year: z.number().min(1800).max(2030).optional().nullable(),
    quality_level: z.string().min(1, 'Quality level is required'),
    blur_present: z.boolean().default(false),
    shadow_present: z.boolean().default(false),
    skew_present: z.boolean().default(false),
    low_contrast: z.boolean().default(false),
    faded_text: z.boolean().default(false),
    multi_column: z.boolean().default(false),
    contains_tables: z.boolean().default(false),
    contains_stamps: z.boolean().default(false),
    contains_sensitive_info: z.boolean().default(false),
    consent_given: z.boolean().refine(val => val === true, { message: 'You must confirm consent to share this document for research' }),
    contributor_notes: z.string().max(1000).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
export type MetadataInput = z.infer<typeof metadataSchema>;
