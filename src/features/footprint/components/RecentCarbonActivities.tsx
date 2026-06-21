import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { formatDisplayLabel } from '@/src/lib/format-label';

type RecentCarbonActivity = {
  id: string;
  category: string;
  activityType?: string | null;
  subType: string;
  quantity: number;
  unit: string;
  co2eKg: number;
  occurredAt: string;
};

export default function RecentCarbonActivities({
  activities,
}: {
  activities: RecentCarbonActivity[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Carbon Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-text-secondary">No carbon activities logged yet.</p>
        ) : (
          <div className="divide-y divide-border-default">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-text-primary">
                    {formatDisplayLabel(activity.activityType || activity.subType)}
                  </p>
                  <p className="text-text-secondary">
                    {activity.quantity} {activity.unit} · {formatDisplayLabel(activity.category)}
                  </p>
                </div>
                <p className="font-bold text-text-primary">{activity.co2eKg.toFixed(2)} kg CO₂e</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
