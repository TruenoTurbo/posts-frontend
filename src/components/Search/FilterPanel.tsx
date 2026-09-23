// components/Search/FilterPanel.tsx
import React, { useState, useEffect } from 'react';
import { SearchFilters } from '../../types';
import { ApiClient } from '../../api/client';

interface FilterPanelProps {
  onFilterChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  onFilterChange, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters ?? {});
  const [options, setOptions] = useState<{ 
    continents: string[]; 
    countries: string[]; 
    cities: string[] 
  }>({
    continents: [], 
    countries: [], 
    cities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const safeFilters = filters ?? {};
  const safeOptions = {
    continents: Array.isArray(options?.continents) ? options.continents : [],
    countries: Array.isArray(options?.countries) ? options.countries : [],
    cities: Array.isArray(options?.cities) ? options.cities : []
  };

  useEffect(() => {
    let isMounted = true;

    ApiClient.getFilterOptions()
      .then((response) => {
        if (!isMounted) return;
        setOptions(response ?? {
          continents: [],
          countries: [],
          cities: []
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load filter options:', err);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...(filters ?? {}), [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const newFilters = { 
      ...(filters ?? {}), 
      [type === 'start' ? 'startDate' : 'endDate']: value || undefined 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleHasImagesChange = (checked: boolean) => {
    const newFilters = { ...(filters ?? {}), hasImages: checked || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    setFilters({});
    onFilterChange({});
  };

  const handleRemoveFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...(filters ?? {}), [key]: undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFilters = Object.entries(safeFilters)
    .filter(([, value]) => value !== undefined && value !== '' && value !== false)
    .map(([key, value]) => ({
      key: key as keyof SearchFilters,
      value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
    }));

  return (
    <div className="bg-bg-card rounded-2xl border border-border shadow-card overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-bg-secondary/40">
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary font-semibold flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span className="text-base">Filters</span>
          </h3>
          {activeFilters.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs font-medium text-text-secondary hover:text-accent 
                         transition-colors px-2 py-1 rounded-lg hover:bg-bg-primary"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Fields */}
      <div className="p-5">
        {/* Grid: 3 columns for selects, date on full-width row below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Continent */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="continent" 
              className="text-xs font-medium text-text-secondary uppercase tracking-wide"
            >
              Continent
            </label>
            <select
              id="continent"
              value={safeFilters.continent || ''}
              onChange={(e) => handleChange('continent', e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary 
                        text-text-primary text-sm font-medium
                        focus:outline-none focus:ring-2 focus:border-accent 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:border-accent/50 transition-all cursor-pointer
                        appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iIzY1Njc2YiIgZD0iTTIgNGw0IDQgNC00Ii8+PC9zdmc+')] 
                        bg-no-repeat bg-[right_1rem_center] bg-[length:12px] pr-9"
            >
              <option value="">All</option>
              {isLoading ? (
                <option disabled>Loading...</option>
              ) : safeOptions.continents.length > 0 ? (
                safeOptions.continents.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                <option disabled>No data</option>
              )}
            </select>
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="country" 
              className="text-xs font-medium text-text-secondary uppercase tracking-wide"
            >
              Country
            </label>
            <select
              id="country"
              value={safeFilters.country || ''}
              onChange={(e) => handleChange('country', e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary 
                        text-text-primary text-sm font-medium
                        focus:outline-none focus:ring-2 focus:border-accent 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:border-accent/50 transition-all cursor-pointer
                        appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iIzY1Njc2YiIgZD0iTTIgNGw0IDQgNC00Ii8+PC9zdmc+')] 
                        bg-no-repeat bg-[right_1rem_center] bg-[length:12px] pr-9"
            >
              <option value="">All</option>
              {isLoading ? (
                <option disabled>Loading...</option>
              ) : safeOptions.countries.length > 0 ? (
                safeOptions.countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                <option disabled>No data</option>
              )}
            </select>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="city" 
              className="text-xs font-medium text-text-secondary uppercase tracking-wide"
            >
              City
            </label>
            <select
              id="city"
              value={safeFilters.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary 
                        text-text-primary text-sm font-medium
                        focus:outline-none focus:ring-2 focus:border-accent 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:border-accent/50 transition-all cursor-pointer
                        appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iIzY1Njc2YiIgZD0iTTIgNGw0IDQgNC00Ii8+PC9zdmc+')] 
                        bg-no-repeat bg-[right_1rem_center] bg-[length:12px] pr-9"
            >
              <option value="">All</option>
              {isLoading ? (
                <option disabled>Loading...</option>
              ) : safeOptions.cities.length > 0 ? (
                safeOptions.cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                <option disabled>No data</option>
              )}
            </select>
          </div>
        </div>

        {/* Images Toggle */}
        <div className="mt-4 pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(safeFilters.hasImages)}
              onChange={(e) => handleHasImagesChange(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span>Only posts with images</span>
          </label>
        </div>

        {/* Date Range - FULL WIDTH ROW BELOW */}
        <div className="mt-4 pt-4 border-t border-border">
          <label 
            className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-2"
          >
            Date Posted
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="date"
                value={safeFilters.startDate || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary 
                          text-text-primary text-xs font-medium
                          focus:outline-none focus:ring-2 focus:border-accent 
                          hover:border-accent/50 transition-all
                          [&::-webkit-calendar-picker-indicator]:opacity-70 
                          [&::-webkit-calendar-picker-indicator]:hover:opacity-100
                          [&::-webkit-calendar-picker-indicator]:cursor-pointer
                          min-w-0"
                placeholder="From"
              />
              <span className="text-text-tertiary text-sm flex-shrink-0">—</span>
              <input
                type="date"
                value={safeFilters.endDate || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg-primary 
                          text-text-primary text-xs font-medium
                          focus:outline-none focus:ring-2 focus:border-accent 
                          hover:border-accent/50 transition-all
                          [&::-webkit-calendar-picker-indicator]:opacity-70 
                          [&::-webkit-calendar-picker-indicator]:hover:opacity-100
                          [&::-webkit-calendar-picker-indicator]:cursor-pointer
                          min-w-0"
                placeholder="To"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Tags - Scrollable Container */}
        {activeFilters.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-tertiary">Active filters:</span>
              <button 
                onClick={handleClearAll}
                className="text-xs text-text-secondary hover:text-error transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-16 overflow-y-auto scrollbar-thin pr-1">
              {activeFilters.map(({ key, value }) => (
                <span 
                  key={key} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 
                            bg-accent-light text-accent rounded-full text-xs font-medium 
                            border border-accent/20 hover:border-accent/40 
                            transition-colors group"
                >
                  <span className="capitalize">{key}:</span>
                  <span className="font-semibold">{value}</span>
                  <button 
                    onClick={() => handleRemoveFilter(key)}
                    className="w-4 h-4 flex items-center justify-center rounded-full 
                              hover:bg-accent/20 transition-colors ml-0.5"
                    aria-label={`Remove ${key} filter`}
                  >
                    <span className="text-[10px] leading-none">×</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};