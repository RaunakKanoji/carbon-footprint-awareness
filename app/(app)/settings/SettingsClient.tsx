'use client';

import * as Icons from 'lucide-react';

import React, { useEffect, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetRecord {
  id: string;
  month: string; // ISO string
  targetKg: number;
}

interface SettingsClientProps {
  initialBudgets: BudgetRecord[];
}

const fieldClassName =
  'w-full rounded-xl border border-border-default bg-bg-base px-4 py-2.5 text-sm text-text-primary transition-colors placeholder:text-text-muted focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50';

export default function SettingsClient({ initialBudgets }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State — use UTC date to avoid local-timezone shifting the month picker default
  const now = new Date();
  const defaultMonthStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(defaultMonthStr);
  const [targetKg, setTargetKg] = useState('500');

  // Request & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Format an ISO date string as a human-readable month label, always in UTC
  // so the display matches the stored UTC date and never shifts by local offset.
  const formatMonth = (isoString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(isoString));
  };

  // Determine budget status using pure UTC comparison so no local offset shifts the month.
  const getBudgetStatus = (isoString: string): 'Active' | 'Archived' | 'Upcoming' => {
    const now = new Date();
    const currentMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const recordDate = new Date(isoString);
    const recordMonthUTC = new Date(
      Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), 1),
    );

    if (recordMonthUTC.getTime() === currentMonthUTC.getTime()) return 'Active';
    if (recordMonthUTC.getTime() < currentMonthUTC.getTime()) return 'Archived';
    return 'Upcoming';
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

      // Format the month string safely using UTC to get the correct label
      const [y, m] = month.split('-').map(Number);
      const labelDate = new Date(Date.UTC(y, m - 1, 1));
      const monthLabel = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(labelDate);

      setSuccessMsg(`Successfully configured budget of ${parsedTarget} kg CO₂e for ${monthLabel}!`);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full animate-fade-in">
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
                  className={`${fieldClassName} cursor-pointer`}
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
                    className={`${fieldClassName} pr-16`}
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
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                id="budget-submit-button"
              >
                {isSubmitting || isPending ? (
                  <>
                    <Icons.Loader className="w-4 h-4 animate-spin" />
                    <span>Saving Target…</span>
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
                      const status = mounted ? getBudgetStatus(budgetRecord.month) : 'Archived';
                      const isActive = status === 'Active';

                      return (
                        <tr
                          key={budgetRecord.id}
                          className={`transition-colors hover:bg-bg-elevated/60 ${
                            isActive ? 'bg-emerald-500/5 font-semibold' : ''
                          }`}
                        >
                          <td className="flex items-center gap-2 px-4 py-3 text-text-primary">
                            <Icons.Calendar className="w-4 h-4 text-text-secondary shrink-0" />
                            <span>{formatMonth(budgetRecord.month)}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-text-primary tabular-nums">
                            {budgetRecord.targetKg.toFixed(0)} kg CO₂e
                          </td>
                          <td className="px-4 py-3 text-right">
                            {status === 'Active' && (
                              <span className="inline-flex items-center rounded-full border border-accent-primary/20 bg-accent-primary-dim px-2.5 py-0.5 text-xs font-semibold text-accent-primary">
                                Active
                              </span>
                            )}
                            {status === 'Archived' && (
                              <span className="inline-flex items-center rounded-full border border-border-default bg-bg-elevated px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
                                Archived
                              </span>
                            )}
                            {status === 'Upcoming' && (
                              <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                Upcoming
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
