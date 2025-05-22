
import { z } from 'zod';

export const searchFormSchema = z.object({
  query: z.string().min(1, { message: 'Search query is required.' }),
  category: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  priceMin: z.preprocess(
    (val) => (String(val).trim() === '' ? undefined : Number(val)),
    z.number().min(0, "Minimum price must be non-negative.").optional()
  ),
  priceMax: z.preprocess(
    (val) => (String(val).trim() === '' ? undefined : Number(val)),
    z.number().min(0, "Maximum price must be non-negative.").optional()
  ),
  referenceNumber: z.string().optional(),
}).refine(data => {
  if (data.priceMin !== undefined && data.priceMax !== undefined) {
    return data.priceMax >= data.priceMin;
  }
  return true;
}, {
  message: "Max price must be greater than or equal to min price.",
  path: ["priceMax"],
}).refine(data => {
  if (data.dateRange?.from && data.dateRange?.to) {
    return data.dateRange.to >= data.dateRange.from;
  }
  return true;
}, {
  message: "End date must be after or same as start date.",
  path: ["dateRange"],
});
