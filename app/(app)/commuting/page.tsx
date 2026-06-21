import { redirect } from 'next/navigation';

export default function CommutingRedirectPage() {
  redirect('/log/transport');
}
