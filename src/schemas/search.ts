import { z } from "zod";
export const ProgramSearchSchema = z.object({
    oh: z.boolean().optional(),
    ou: z.string(),
    trackedEntityType: z.string(),
});
export const TrackerSearchSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    th: z.boolean().optional(),
    selectedKeys: z.string().optional(),
});

export const EventSearchSchema = z.object({
    ps: z.string().optional(),
});

export type TrackerSearch = z.infer<typeof TrackerSearchSchema>;
