import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white py-12 select-none">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-gray-50">
          {/* Logo & Description */}
          <div className="space-y-3 max-w-sm">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-gray-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Leaf className="h-4 w-4 fill-current" />
              </div>
              <span>Carbon Compass</span>
            </Link>
            <p className="text-[12px] text-textSecondary leading-relaxed">
              An AI-powered carbon footprint awareness and habit-building platform. Live lighter and track progress together.
            </p>
          </div>

          {/* Quick links columns */}
          <div className="flex flex-wrap gap-8 sm:gap-16">
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</h5>
              <div className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
                <a href="#features" className="hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
                <a href="#extension" className="hover:text-primary transition-colors">Browser Extension</a>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resources</h5>
              <div className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
                <a href="#data-sources" className="hover:text-primary transition-colors">Data Sources</a>
                <Link href="/sign-in" className="hover:text-primary transition-colors">Account Login</Link>
                <Link href="/sign-up" className="hover:text-primary transition-colors">Get Started</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-textMuted font-medium">
          <div>
            &copy; {new Date().getFullYear()} Carbon Compass. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built for the</span>
            <span className="font-bold text-emerald-600">Carbon Footprint Awareness Platform</span>
            <span>challenge.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
