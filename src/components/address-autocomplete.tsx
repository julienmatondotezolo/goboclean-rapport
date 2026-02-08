'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  className?: string;
  noResultsText?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Zoek adres...',
  className = '',
  noResultsText = 'Geen resultaten gevonden',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setShowDropdown(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=be&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'nl',
          },
        }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(val);
    }, 300);
  };

  const handleSelect = (result: NominatimResult) => {
    // Build a clean Belgian address
    const addr = result.address;
    let formatted = result.display_name;
    if (addr) {
      const parts: string[] = [];
      if (addr.road) {
        parts.push(addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road);
      }
      const city = addr.city || addr.town || addr.village || addr.municipality;
      if (addr.postcode && city) {
        parts.push(`${addr.postcode} ${city}`);
      } else if (city) {
        parts.push(city);
      }
      if (parts.length > 0) {
        formatted = parts.join(', ');
      }
    }

    setQuery(formatted);
    onChange(formatted);
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className={`pl-14 ${className}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-5 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
          {results.length === 0 && hasSearched && !isLoading ? (
            <div className="px-4 py-3 text-[13px] text-gray-400">
              {noResultsText}
            </div>
          ) : (
            results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] transition-colors border-b border-gray-50 last:border-b-0 flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-[#a3e635] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-gray-700 leading-snug">
                  {result.display_name}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
