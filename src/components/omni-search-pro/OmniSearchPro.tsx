
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Search, Package, Tag, ListChecks, Info, DollarSign, Loader2, RefreshCcw, AlertCircle } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Combobox } from '@/components/ui/combobox';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { searchFormSchema } from './search-form-schema';
import type { SearchFormData, SelectOption } from '@/types/search-form-types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const categories: SelectOption[] = [
  { value: 'products', label: 'Products', icon: Package },
  { value: 'services', label: 'Services', icon: ListChecks },
  { value: 'locations', label: 'Locations', icon: Info },
];

const statuses: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
];

const allTags: SelectOption[] = [
  { value: 'urgent', label: 'Urgent', icon: Tag },
  { value: 'new', label: 'New', icon: Tag },
  { value: 'featured', label: 'Featured', icon: Tag },
  { value: 'internal', label: 'Internal', icon: Tag },
  { value: 'external', label: 'External', icon: Tag },
];

interface OmniSearchProProps {
  onSearch: (data: SearchFormData) => Promise<void>;
  initialValues?: Partial<SearchFormData>;
  isLoading?: boolean;
  error?: string | null;
}

const DEBOUNCE_DELAY = 750;

export function OmniSearchPro({ 
  onSearch, 
  initialValues: propInitialValues,
  isLoading: externalLoading = false,
  error: externalError = null
}: OmniSearchProProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // For explicit submit
  const [internalError, setInternalError] = useState<string | null>(null);

  const defaultValues: Partial<SearchFormData> = {
    query: '',
    tags: [],
    ...propInitialValues,
  };

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues,
    mode: 'onChange', // Validate on change for better UX with debouncing
  });

  // Debounce function (generic)
  const debounce = <F extends (...args: any[]) => void>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateUrlAndSearch = useCallback(
    debounce(async (data: SearchFormData) => {
      const newParams = new URLSearchParams();
      if (data.query) newParams.set('query', data.query);
      if (data.category) newParams.set('category', data.category);
      if (data.status) newParams.set('status', data.status);
      if (data.tags && data.tags.length > 0) newParams.set('tags', data.tags.join(','));
      if (data.dateRange?.from) newParams.set('dateFrom', format(data.dateRange.from, 'yyyy-MM-dd'));
      if (data.dateRange?.to) newParams.set('dateTo', format(data.dateRange.to, 'yyyy-MM-dd'));
      if (data.priceMin !== undefined) newParams.set('priceMin', String(data.priceMin));
      if (data.priceMax !== undefined) newParams.set('priceMax', String(data.priceMax));
      if (data.referenceNumber) newParams.set('referenceNumber', data.referenceNumber);
      
      router.push(`${window.location.pathname}?${newParams.toString()}`, { scroll: false });
      
      // Don't set loading/error for debounced search to avoid UI flicker
      // The main submit will handle explicit loading/error states
      if (form.formState.isValid && data.query) {
        await onSearch(data);
      }
    }, DEBOUNCE_DELAY),
    [router, onSearch, form.formState.isValid] 
  );

  // Initialize form from URL parameters on mount
  useEffect(() => {
    const urlValues: Partial<SearchFormData> = {};
    if (searchParams.has('query')) urlValues.query = searchParams.get('query')!;
    if (searchParams.has('category')) urlValues.category = searchParams.get('category')!;
    if (searchParams.has('status')) urlValues.status = searchParams.get('status')!;
    if (searchParams.has('tags')) urlValues.tags = searchParams.get('tags')!.split(',');
    const dateFromString = searchParams.get('dateFrom');
    const dateToString = searchParams.get('dateTo');
    if (dateFromString || dateToString) {
      urlValues.dateRange = {
        from: dateFromString ? parseISO(dateFromString) : undefined,
        to: dateToString ? parseISO(dateToString) : undefined,
      };
    }
    if (searchParams.has('priceMin')) urlValues.priceMin = Number(searchParams.get('priceMin'));
    if (searchParams.has('priceMax')) urlValues.priceMax = Number(searchParams.get('priceMax'));
    if (searchParams.has('referenceNumber')) urlValues.referenceNumber = searchParams.get('referenceNumber')!;
    
    form.reset({ ...defaultValues, ...urlValues });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form.reset]); // Only on mount or if searchParams genuinely change from external navigation


  // Watch form values for debounced updates
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (form.formState.isDirty) { // Only if form has been touched by user
        debouncedUpdateUrlAndSearch(values as SearchFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.isDirty, debouncedUpdateUrlAndSearch]);

  const onSubmitHandler = async (data: SearchFormData) => {
    setIsSubmittingForm(true);
    setInternalError(null);
    try {
      await onSearch(data); // Explicit submit always calls onSearch
       const newParams = new URLSearchParams();
        if (data.query) newParams.set('query', data.query);
        if (data.category) newParams.set('category', data.category);
        if (data.status) newParams.set('status', data.status);
        if (data.tags && data.tags.length > 0) newParams.set('tags', data.tags.join(','));
        if (data.dateRange?.from) newParams.set('dateFrom', format(data.dateRange.from, 'yyyy-MM-dd'));
        if (data.dateRange?.to) newParams.set('dateTo', format(data.dateRange.to, 'yyyy-MM-dd'));
        if (data.priceMin !== undefined) newParams.set('priceMin', String(data.priceMin));
        if (data.priceMax !== undefined) newParams.set('priceMax', String(data.priceMax));
        if (data.referenceNumber) newParams.set('referenceNumber', data.referenceNumber);
        router.push(`${window.location.pathname}?${newParams.toString()}`, { scroll: false });
    } catch (e) {
      setInternalError(e instanceof Error ? e.message : "An unknown error occurred during submission.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleReset = () => {
    form.reset(defaultValues); // Reset to initial default values, not URL ones
    router.push(window.location.pathname, { scroll: false }); // Clear URL params
    setInternalError(null);
    // Optionally trigger onSearch with empty values to clear results
    // onSearch(defaultValues as SearchFormData); 
  };

  const currentLoadingState = isSubmittingForm || externalLoading;
  const currentErrorState = internalError || externalError;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8 p-4 md:p-6 lg:p-8 bg-card shadow-xl rounded-xl border border-border/70">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="lg:col-span-3">
                <FormLabel>Search Query <span className="text-destructive font-semibold">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Enter your search query..." {...field} className="pl-10 text-base" aria-required="true" />
                  </div>
                </FormControl>
                <FormDescription>The main term to search for. This field is required.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Combobox
                  options={categories}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select category..."
                  searchPlaceholder="Search categories..."
                  notFoundMessage="No category found."
                  disabled={currentLoadingState}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Combobox
                  options={statuses}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select status..."
                  searchPlaceholder="Search statuses..."
                  notFoundMessage="No status found."
                  disabled={currentLoadingState}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags/Labels</FormLabel>
                <MultiSelectCombobox
                  options={allTags}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select tags..."
                  searchPlaceholder="Search tags..."
                  notFoundMessage="No tags found."
                  disabled={currentLoadingState}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Range</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal justify-start",
                          !field.value?.from && "text-muted-foreground"
                        )}
                        disabled={currentLoadingState}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={{from: field.value?.from, to: field.value?.to} as DateRange}
                      onSelect={(range) => field.onChange(range || {from: undefined, to: undefined})}
                      numberOfMonths={2}
                      disabled={currentLoadingState}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priceMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ''} className="pl-8" disabled={currentLoadingState} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Price</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" placeholder="Any" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ''} className="pl-8" disabled={currentLoadingState}/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="referenceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., REF12345" {...field} value={field.value ?? ''} disabled={currentLoadingState} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {currentErrorState && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{currentErrorState}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-border/70">
          <Button type="button" variant="outline" onClick={handleReset} disabled={currentLoadingState} className="sm:w-auto w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button type="submit" disabled={currentLoadingState || !form.formState.isValid} className="bg-primary hover:bg-primary/90 text-primary-foreground sm:w-auto w-full">
            {currentLoadingState ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </div>
      </form>
    </Form>
  );
}
