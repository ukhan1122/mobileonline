'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Browse Phones' },
  { href: '/brands', label: 'Brands' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // "Add Phone" link is ONLY visible when running locally with `npm run dev`.
  // In production builds the link is completely removed (users on the live site cannot see or access it).
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">WM</span>
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight text-gray-900">WhatMobile</div>
              <div className="text-[10px] text-emerald-600 -mt-1">Pakistan</div>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones (e.g. Samsung A35, iPhone 16)"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-emerald-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isDevelopment && (
              <Link
                href="/add-phone"
                className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
              >
                Add Phone
              </Link>
            )}
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-sm hover:bg-emerald-700 transition-colors"
            >
              <Search className="h-4 w-4" /> Browse All
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Search + Nav */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t pt-4">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phones..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-500"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>

            <nav className="flex flex-col gap-1 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isDevelopment && (
                <Link
                  href="/add-phone"
                  className="px-3 py-2 text-emerald-700 hover:bg-gray-100 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Add Phone
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
