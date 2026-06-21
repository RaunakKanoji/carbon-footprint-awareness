'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Leaf, Menu, X } from 'lucide-react';

interface LandingNavProps {
  hasUser: boolean;
}

export default function LandingNav({ hasUser }: LandingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-textPrimary hover:opacity-90 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Leaf className="h-4 h-4 fill-current" />
              </div>
              <span className="text-text-primary">Carbon Compass</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="#impact" className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">
              Impact
            </a>
            <a href="#extension" className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">
              Extension
            </a>
            <a href="#data-sources" className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">
              Data Sources
            </a>
          </div>

          {/* Right side CTA */}
          <div className="hidden md:flex items-center gap-4">
            {hasUser ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primaryHover transition-all shadow-sm active:scale-[0.98]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors">
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primaryHover transition-all shadow-sm active:scale-[0.98]"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-textSecondary hover:bg-surfaceSoft hover:text-textPrimary focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background animate-fade-in">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-textSecondary hover:bg-surfaceSoft hover:text-textPrimary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-textSecondary hover:bg-surfaceSoft hover:text-textPrimary transition-colors"
            >
              How it Works
            </a>
            <a
              href="#impact"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-textSecondary hover:bg-surfaceSoft hover:text-textPrimary transition-colors"
            >
              Impact
            </a>
            <a
              href="#extension"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-textSecondary hover:bg-surfaceSoft hover:text-textPrimary transition-colors"
            >
              Extension
            </a>
            <a
              href="#data-sources"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-textSecondary hover:bg-surfaceSoft hover:text-textPrimary transition-colors"
            >
              Data Sources
            </a>
            <div className="mt-4 border-t border-border pt-4 flex flex-col gap-3 px-3">
              {hasUser ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primaryHover transition-all text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="block text-center py-2.5 text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primaryHover transition-all text-center"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
