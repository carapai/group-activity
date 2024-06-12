import { z } from "zod";

export const TrackerSearchSchema = z.object({
    ou: z.string(),
    registration: z.boolean(),
});
export const EntitySearchSchema = z.object({
    tei: z.string().optional(),
    program: z.string(),
    enrollment: z.string().optional(),
});
export const EventSearchSchema = z.object({
    tei: z.string().optional(),
    enrollment: z.string().optional(),
    event: z.string().optional(),
});

export type TrackerSearch = z.infer<typeof TrackerSearchSchema>;
