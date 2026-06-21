import PageHeader from '@/src/app-shell/page-header';
import ReceiptClient from '@/src/features/activity-logging/components/ReceiptClient';

export default function ReceiptPage() {
  return <div className="flex min-h-0 w-full flex-col gap-6 pb-6"><PageHeader title="Receipt Upload" description="Upload any supported receipt or bill, review the interpreted activity, and save it." /><ReceiptClient /></div>;
}
