
import type { z } from 'zod';
import type { searchFormSchema } from '@/components/omni-search-pro/search-form-schema';

export type SearchFormData = z.infer<typeof searchFormSchema>;

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}
