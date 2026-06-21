import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';

interface CategoryBreakdownItem {
  category: string;
  co2eKg: number;
}

interface ProfileCategoryBreakdownProps {
  data: CategoryBreakdownItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: '#3b82f6', // Blue
  ENERGY: '#f59e0b', // Amber
  ELECTRICITY: '#f59e0b', // Amber
  FOOD: '#10b981', // Emerald
  SHOPPING: '#8b5cf6', // Violet
  WASTE: '#ef4444', // Red
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  FOOD: Icons.Utensils,
  TRANSPORT: Icons.Car,
  ENERGY: Icons.Zap,
  SHOPPING: Icons.ShoppingBag,
  WASTE: Icons.Trash2,
};

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: { fill?: string } }>;
}

const CustomPieTooltip = ({ active, payload }: PieTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    if (!item) return null;
    const name = item.name;
    const value = item.value;
    
    const formatCategoryLocal = (cat: string) => {
      if (cat === 'ENERGY' || cat === 'ELECTRICITY') return 'Energy';
      return cat.charAt(0) + cat.slice(1).toLowerCase();
    };

    const color = item.color || item.payload?.fill || item.fill || '#9ca3af';

    return (
      <div className="rounded-2xl border border-border-default bg-bg-surface p-3 shadow-md text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-text-primary">{formatCategoryLocal(String(name))}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-text-secondary">
            <span className="flex items-center gap-1.5 min-w-0 text-text-secondary truncate">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate">Emissions</span>
            </span>
            <span className="font-semibold text-text-primary shrink-0">{Number(value).toFixed(1)} kg</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ProfileCategoryBreakdown({ data }: ProfileCategoryBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.co2eKg, 0);

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.co2eKg,
    percentage: total > 0 ? (item.co2eKg / total) * 100 : 0,
  }));

  const formatCategory = (cat: string) => {
    if (cat === 'ENERGY' || cat === 'ELECTRICITY') return 'Energy';
    return cat.charAt(0) + cat.slice(1).toLowerCase();
  };

  return (
    <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
      <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
          <Icons.PieChart className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-text-primary">
            Category Breakdown
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Carbon emissions by category for this month.
          </p>
        </div>
      </div>

      <CardContent className="p-5">
        {total > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Recharts PieChart */}
            <div className="h-44 w-full flex justify-center items-center" role="img" aria-label="Emissions distribution chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    isAnimationActive
                  >
                    {chartData.map((item, idx) => (
                      <Cell
                        key={idx}
                        fill={CATEGORY_COLORS[item.name] ?? '#9ca3af'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List with progress indicators */}
            <div className="space-y-3">
              {chartData.map((item) => {
                const IconComponent = CATEGORY_ICONS[item.name] || (Icons.Package as React.ComponentType<{ className?: string; style?: React.CSSProperties }>);
                const color = CATEGORY_COLORS[item.name] || '#9ca3af';

                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 text-text-primary">
                        <span className="p-1 rounded bg-bg-base text-text-secondary shrink-0">
                          <IconComponent className="w-3.5 h-3.5" style={{ color }} />
                        </span>
                        <span>{formatCategory(item.name)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-extrabold">{item.value.toFixed(1)} kg</span>
                        <span className="text-text-muted">({item.percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-bg-base rounded-full overflow-hidden border border-border-subtle">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-elevated/35 px-6 py-12 text-center">
            <Icons.PieChart className="h-8 w-8 text-text-muted mb-3 animate-pulse" />
            <p className="text-sm font-black text-text-primary">No carbon summary yet</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-text-secondary">
              Start logging food, transport, energy, shopping, or waste activities to build your profile.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
