'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

export default function ReceiptClient() {
  const [filename, setFilename] = useState('');
  const [receiptType, setReceiptType] = useState('GROCERY');
  const [category, setCategory] = useState('FOOD');
  const [subType, setSubType] = useState('packagedFood');
  const [quantity, setQuantity] = useState('1');
  const [activityId, setActivityId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    const response = await fetch('/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptType, filename, category, subType, quantity: Number(quantity) }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'Could not save receipt.');
    setActivityId(data.activityId);
    setMessage(`Saved ${data.estimate.co2eKg.toFixed(2)} kg CO₂e · ${data.estimate.sourceLabel}`);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Upload and review receipt</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input type="file" accept="image/*,.pdf" onChange={(event) => setFilename(event.target.files?.[0]?.name ?? '')} />
        <p className="text-sm text-text-secondary">OCR is not configured, so review and edit the values below before saving.</p>
        <select className="w-full rounded-xl border border-border-default bg-bg-base px-3 py-2 text-sm" value={receiptType} onChange={(e) => setReceiptType(e.target.value)}>
          {['FOOD', 'GROCERY', 'ELECTRICITY_BILL', 'FUEL', 'SHOPPING', 'TRAVEL', 'HOTEL'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="w-full rounded-xl border border-border-default bg-bg-base px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          {['FOOD', 'TRANSPORT', 'ENERGY', 'SHOPPING', 'WASTE'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <Input value={subType} onChange={(e) => setSubType(e.target.value)} placeholder="Activity type" />
        <Input type="number" min="0.001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Button type="button" onClick={save}>Estimate and Save</Button>
        {message && <p className="text-sm text-text-secondary">{message}</p>}
        {activityId && <Link className="text-sm font-semibold text-accent-primary" href={`/activity/${activityId}`}>View saved activity</Link>}
      </CardContent>
    </Card>
  );
}
