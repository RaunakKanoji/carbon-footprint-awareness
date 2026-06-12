'use client';

import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetRecord {
  id: string;
  month: string; // ISO string
  targetKg: number;
}

interface SettingsClientProps {
  initialBudgets: BudgetRecord[];
}

export default function SettingsClient({ initialBudgets }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const now = new Date();
  const defaultMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(defaultMonthStr);
  const [targetKg, setTargetKg] = useState('500');

  // Request & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to format ISO Date to readable month and year
  const formatMonth = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  // Check if a record is for the current calendar month
  const isCurrentMonth = (isoString: string) => {
    const recordDate = new Date(isoString);
    const currentDate = new Date();
    return (
      recordDate.getUTCFullYear() === currentDate.getFullYear() &&
      recordDate.getUTCMonth() === currentDate.getMonth()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const parsedTarget = parseFloat(targetKg);

    // Validation
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMsg('Monthly carbon budget target must be a positive number.');
      setIsSubmitting(false);
      return;
    }

    if (!month) {
      setErrorMsg('Please select a valid month.');
      setIsSubmitting(false);
      return;
    }

    try {
      // API payload requires a month date representation
      // We append -01 to represent the first day of that month
      const monthDateStr = `${month}-01`;

      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: monthDateStr,
          targetKg: parsedTarget,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save carbon budget.');
      }

      setSuccessMsg(`Successfully configured budget of ${parsedTarget} kg CO₂e for ${formatMonth(monthDateStr)}!`);

      // Refresh server component data
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error('Save Budget Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full pb-12 animate-fade-in">
      {/* Left Columns: Form Container */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/60 bg-bg-surface">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Icons.Target className="w-5 h-5 text-accent-primary" />
              <span>Configure Target</span>
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Set or update your monthly carbon budget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" id="budget-settings-form">
              {/* Select Month */}
              <div className="space-y-1.5">
                <label
                  htmlFor="budget-month-input"
                  className="text-xs font-bold text-text-secondary uppercase tracking-wider block"
                >
                  Budget Month
                </label>
                <input
                  id="budget-month-input"
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
                  required
                />
              </div>

              {/* Target Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="budget-target-input"
                  className="text-xs font-bold text-text-secondary uppercase tracking-wider block"
                >
                  Target Limit (kg CO₂e)
                </label>
                <div className="relative flex items-center">
                  <input
                    id="budget-target-input"
                    type="number"
                    min="1"
                    step="any"
                    placeholder="e.g. 500"
                    value={targetKg}
                    onChange={(e) => setTargetKg(e.target.value)}
                    className="w-full px-4 py-2 pr-16 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                    required
                  />
                  <span className="absolute right-4 text-xs font-semibold text-text-muted">
                    kg CO₂e
                  </span>
                </div>
              </div>

              {/* Success / Error Messages */}
              {successMsg && (
                <div
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-2 text-xs font-medium animate-slide-in"
                  id="budget-success-banner"
                >
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div
                  className="p-3 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 rounded-xl flex items-start gap-2 text-xs font-medium animate-slide-in"
                  id="budget-error-banner"
                >
                  <Icons.AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                id="budget-submit-button"
              >
                {isSubmitting || isPending ? (
                  <>
                    <Icons.Loader className="w-4 h-4 animate-spin" />
                    <span>Saving Target...</span>
                  </>
                ) : (
                  <>
                    <Icons.Save className="w-4 h-4" />
                    <span>Apply Carbon Budget</span>
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Historical / Active Budgets */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="hover:shadow-md transition-shadow duration-200 border-border-default/60 bg-bg-surface h-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Icons.History className="w-5 h-5 text-accent-primary" />
              <span>Budget Limits History</span>
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Logs of previously configured monthly carbon budgets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {initialBudgets.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm" id="budget-history-table">
                  <thead>
                    <tr className="border-b border-border-default text-text-secondary text-xs uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Month</th>
                      <th className="py-3 px-4 font-semibold text-right">Target Limit</th>
                      <th className="py-3 px-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default/50 text-text-primary">
                    {initialBudgets.map((budgetRecord) => {
                      const current = isCurrentMonth(budgetRecord.month);

                      return (
                        <tr
                          key={budgetRecord.id}
                          className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                            current ? 'bg-emerald-500/5 dark:bg-emerald-500/10 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 flex items-center gap-2 text-text-primary">
                            <Icons.Calendar className="w-4 h-4 text-text-secondary shrink-0" />
                            <span>{formatMonth(budgetRecord.month)}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-text-primary">
                            {budgetRecord.targetKg.toFixed(0)} kg CO₂e
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {current ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                                Active Month
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-border-default px-2 py-0.5 text-[10px] font-medium text-text-secondary uppercase tracking-wide">
                                Archived
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-text-secondary space-y-3">
                <div className="p-4 rounded-full bg-bg-base text-text-muted">
                  <Icons.Calendar className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">No budgets set yet</p>
                  <p className="text-xs text-text-muted max-w-[280px] mt-1 mx-auto">
                    Use the form on the left to set your first carbon budget target limits.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
