'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

import { saveCarbonBudget } from '../actions';

const goals = [
  { label: 'Easy goal', value: 3, type: 'EASY' },
  { label: 'Balanced goal', value: 7, type: 'BALANCED' },
  { label: 'Ambitious goal', value: 15, type: 'AMBITIOUS' },
];

export default function BudgetSetupClient({ baseline }: { baseline: number }) {
  const router = useRouter();
  const [selected, setSelected] = useState(goals[1]);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    await saveCarbonBudget({
      reductionPercentage: selected.value,
      budgetType: custom ? 'CUSTOM' : selected.type,
      customMonthlyKg: custom ? Number(custom) : undefined,
    });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose your reduction target</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">
          Baseline: {baseline.toFixed(1)} kg CO₂e per month
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {goals.map((goal) => (
            <Button
              key={goal.type}
              type="button"
              variant={selected.type === goal.type ? 'default' : 'outline'}
              onClick={() => {
                setSelected(goal);
                setCustom('');
              }}
            >
              {goal.label} · {goal.value}%
            </Button>
          ))}
        </div>
        <label className="grid gap-2 text-sm font-medium text-text-primary">
          Custom monthly budget (optional)
          <Input
            type="number"
            min="1"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
          />
        </label>
        <Button type="button" disabled={saving} onClick={submit}>
          {saving ? 'Saving…' : 'Save Budget and Continue'}
        </Button>
      </CardContent>
    </Card>
  );
}
