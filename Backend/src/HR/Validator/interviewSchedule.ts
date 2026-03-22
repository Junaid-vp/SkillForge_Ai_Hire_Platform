import { z } from "zod";

export const interviewSchedule = z.object({
  developerName: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  developerEmail: z
    .string()
    .email("Enter a valid email address"),

  position: z
    .string()
    .min(2, "Position must be at least 2 characters"),

  experience: z
    .string()
    .min(1, "Experience level is required"),

  interviewDate: z
    .string()
    .refine((value) => {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, {
      message: "Interview date must be today or in the future"
    }),

  interviewTime: z
    .string()
    .min(1, "Interview time is required"),
    uniqueCode: z.string()
    
});