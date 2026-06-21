import { redirect } from 'next/navigation';

const supported = new Set(['food', 'transport', 'energy', 'shopping', 'waste']);

export default async function CategoryLogPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (category === 'receipt') redirect('/log/receipt');
  if (category === 'travel') redirect('/log?category=transport');
  if (category === 'voice') redirect('/coach?prompt=Help%20me%20log%20an%20activity');
  if (supported.has(category)) redirect(`/log?category=${category}`);
  redirect('/log');
}
