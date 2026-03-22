import { z } from "zod";

export const taskLibraryValidate = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  requirements: z.preprocess((val) => {
    if (typeof val === "string") return [val];
    return val;
  }, z.array(z.string()).min(1, "At least one requirement needed")),
  category: z.string().min(2, "Category is required"),
  techStack: z.string().min(2, "Tech stack is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Expert"]),
  duration: z.number().min(1).max(7),
});