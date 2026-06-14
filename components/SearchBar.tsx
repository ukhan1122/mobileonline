'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
  placeholder?: string;
}

export default function SearchBar({
  initialQuery = '',
  className = '',
  placeholder = 'Search phones by name or brand (e.g. Galaxy A35, iPhone)',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-5 py-3.5 text-lg bg-white border border-gray-200 focus:border-emerald-500 rounded-2xl shadow-sm placeholder:text-gray-400 outline-none"
      />
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-1.5 bg-emerald-600 hover:bg-emerald-700 transition text-white text-sm rounded-xl font-medium"
      >
        Search
      </button>
    </form>
  );
}
