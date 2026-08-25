'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, User, Hash } from 'lucide-react';
import Link from 'next/link';
import { Profile } from '@/types/profile';

export default function SearchProfiles() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setIsOpen(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`name.ilike.%${query}%,roll_no.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;
        setResults(data as Profile[]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto z-50">
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition outline-none shadow-sm"
          placeholder="Search by Name or Roll No..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length >= 2) setIsOpen(true) }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {results.map((profile) => (
                <li key={profile.roll_no}>
                  <Link 
                    href={`/e/${profile.roll_no}`}
                    className="flex items-center gap-3 p-3 hover:bg-red-50 transition"
                  >
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{profile.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Hash size={12} /> {profile.roll_no}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No profiles found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
