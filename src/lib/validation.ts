import { z } from "zod"

export const resourceSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(40, { message: "Title must be at most 40 characters" }),
  description: z.string().min(1, { message: "Description is required" }).max(200, { message: "Description must be at most 200 characters" }),
  url: z.string().url({ message: "URL must be valid (include https://...)" }),
  image_address: z.string().url({ message: "Image address must be a valid URL" }).optional().or(z.literal("")),
  opportunity_deadline: z.string().optional().or(z.literal("")),
}) 