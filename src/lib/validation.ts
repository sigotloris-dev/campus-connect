import { z } from "zod";
import { ENGLISH_LEVELS } from "@/lib/constants";

export const RegisterSchema = z.object({
  studentCode: z
    .string()
    .trim()
    .min(3, "Student ID is too short")
    .max(40, "Student ID is too long"),
  firstName: z.string().trim().min(1, "Enter your first name").max(50),
  lastName: z.string().trim().min(1, "Enter your last name").max(50),
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email")),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4 to 6 digits"),
  birthDate: z.string().min(1, "Enter your date of birth"),
  nationality: z.string().length(2, "Select your nationality"),
  englishLevel: z.enum(ENGLISH_LEVELS, { message: "Select your English level" }),
  dormId: z.string().min(1, "Select your dorm"),
  departureDate: z.string().min(1, "Enter your departure date"),
  bio: z.string().trim().max(300, "300 characters max").optional(),
});

export const EditProfileSchema = z.object({
  nationality: z.string().length(2, "Select your nationality"),
  englishLevel: z.enum(ENGLISH_LEVELS, { message: "Select your English level" }),
  dormId: z.string().min(1, "Select your dorm"),
  bio: z.string().trim().max(300, "300 characters max").optional(),
});

export const LoginSchema = z.object({
  studentCode: z.string().trim().min(1, "Enter your student ID"),
  pin: z.string().regex(/^\d{4,6}$/, "Invalid PIN"),
});

export type FieldErrors = Record<string, string[] | undefined>;

export type FormState =
  | { ok: false; error?: string; fieldErrors?: FieldErrors }
  | { ok: true }
  | undefined;
