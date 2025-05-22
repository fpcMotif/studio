
"use client"; 

import React, { useState, Suspense } from 'react';
import { OmniSearchPro } from '@/components/omni-search-pro/OmniSearchPro';
import type { SearchFormData } from '@/types/search-form-types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Wrapper component to handle Suspense for useSearchParams
function OmniSearchProPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchFormData | null>(null);
  const { toast } = useToast();

  const handleSearch = async (data: SearchFormData) => {
    console.log('Search submitted with data:', data);
    setIsLoading(true);
    setSearchError(null);
    setSearchResults(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success or error
    if (data.query && data.query.toLowerCase() === 'error') {
      const errorMsg = 'Simulated search error: Could not process the query.';
      setSearchError(errorMsg);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: errorMsg,
      });
    } else {
      setSearchResults(data);
      toast({
        title: "Search Processed",
        description: "Search data has been processed (check console and results display).",
      });
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            OmniSearch Pro
          </h1>
          <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
            Your advanced solution for comprehensive data exploration.
          </p>
        </header>

        <OmniSearchPro 
          onSearch={handleSearch} 
          isLoading={isLoading}
          error={searchError}
        />

        {searchResults && !isLoading && !searchError && (
          <div className="mt-10 p-6 bg-card shadow-xl rounded-xl border border-border/70">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Search Results (Data Sent)</h2>
            <pre className="text-sm bg-muted/50 p-4 rounded-md overflow-x-auto text-muted-foreground">
              {JSON.stringify(searchResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OmniSearchProPageContent />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </header>
        <div className="space-y-8 p-4 md:p-6 lg:p-8 bg-card shadow-xl rounded-xl border">
          <Skeleton className="h-10 w-full lg:col-span-3" /> {/* Query */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </main>
  );
}
