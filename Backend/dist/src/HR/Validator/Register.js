import { z } from "zod";
export const registerValidate = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
    email: z
        .string()
        .email("Invalid email address"),
    companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters"),
    designation: z
        .string()
        .min(2, "Designation must be at least 2 characters"),
    companyWebsite: z
        .string()
        .url("Invalid website URL"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
});
