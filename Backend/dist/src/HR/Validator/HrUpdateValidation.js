import { z } from "zod";
export const HrUpdationValidation = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
    companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters"),
    designation: z
        .string()
        .min(2, "Designation must be at least 2 characters"),
    companyWebsite: z
        .string()
        .url("Invalid website URL"),
});
