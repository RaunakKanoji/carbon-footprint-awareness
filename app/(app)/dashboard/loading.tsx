import React from 'react';

import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-[120px] justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-3 w-56" />
          </CardHeader>
          <CardContent className="h-[300px] flex items-end gap-2 pt-4">
            {Array.from({ length: 7 }).map((_, i) => {
              const heights = [40, 65, 35, 80, 50, 75, 45];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <Skeleton
                    className="w-full"
                    style={{ height: `${heights[i % heights.length]}%` }}
                  />
                  <Skeleton className="h-3 w-8" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28 mb-1" />
            <Skeleton className="h-3 w-40" />
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center gap-4">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="flex justify-center gap-4 w-full">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations and Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-5 w-44 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex border-b pb-2">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b last:border-0">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
