import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AccountInfoForm from './AccountInfoForm';
import ProfilePreferencesForm from './ProfilePreferencesForm';
import PrivacySettingsForm from './PrivacySettingsForm';
import { Card, CardContent } from '@/src/components/ui/card';
import { useToast } from '@/src/components/ui/toast-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

interface AccountTabProps {
  user: {
    id: string;
    displayName: string;
    email: string;
    city: string;
    state: string;
    country: string;
    householdSize: number;
    dietType: string;
    commuteMode: string;
    commuteDistanceKm: number;
    electricityUsageKwh: number;
    monthlyBudgetKg: number;
  };
  preferences: {
    carbonUnit: string;
    distanceUnit: string;
    leaderboardVisibility: string;
    showCityOnLeaderboard: boolean;
    showCo2eSavedPublicly: boolean;
    showStreakPublicly: boolean;
  };
  onSaveAccount: (data: AccountTabProps['user']) => Promise<void>;
  onSavePreferences: (data: Partial<AccountTabProps['preferences']>) => Promise<void>;
}

export default function AccountTab({
  user,
  preferences,
  onSaveAccount,
  onSavePreferences,
}: AccountTabProps) {
  const { signOut } = useClerk();
  const { toast } = useToast();
  const router = useRouter();
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAccountSave = async (data: Omit<AccountTabProps['user'], 'id'>) => {
    setIsSavingAccount(true);
    try {
      await onSaveAccount({ ...data, id: user.id });
      toast({
        variant: 'success',
        description: 'Account information updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to update account information.',
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePreferencesSave = async (data: Partial<AccountTabProps['preferences']>) => {
    setIsSavingPreferences(true);
    try {
      await onSavePreferences(data);
      toast({
        variant: 'success',
        description: 'Preferences updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to update preferences.',
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleExportData = () => {
    // Generate data export JSON
    const dataStr = JSON.stringify({ user, preferences }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carbon-compass-data-${user.displayName || 'user'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      variant: 'success',
      description: 'Your account data has been successfully exported.',
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/dev/delete-account', {
        method: 'POST',
      });
      if (res.ok) {
        toast({
          variant: 'success',
          description: 'Your account has been deleted.',
        });
        signOut(() => router.push('/'));
      } else {
        throw new Error('Failed to delete account from database.');
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        description: err instanceof Error ? err.message : 'Account deletion failed. Please try again later.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
      <div className="order-1">
        <AccountInfoForm
          initialData={user}
          onSave={handleAccountSave}
          isSaving={isSavingAccount}
        />
      </div>

      <div className="order-2 lg:order-3">
        <ProfilePreferencesForm
          initialData={{
            carbonUnit: preferences.carbonUnit,
            distanceUnit: preferences.distanceUnit,
          }}
          onSave={handlePreferencesSave}
          isSaving={isSavingPreferences}
        />
      </div>

      <div className="order-3 lg:order-2">
        <PrivacySettingsForm
          initialData={{
            leaderboardVisibility: preferences.leaderboardVisibility,
            showCityOnLeaderboard: preferences.showCityOnLeaderboard,
            showCo2eSavedPublicly: preferences.showCo2eSavedPublicly,
            showStreakPublicly: preferences.showStreakPublicly,
          }}
          onSave={handlePreferencesSave}
          isSaving={isSavingPreferences}
        />
      </div>

      {/* Account Actions Section */}
      <div className="order-4">
        <Card className="flex h-full flex-col overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-100">
              <Icons.ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-text-primary">
                Account Actions
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Export, sign out, or delete your account context.
              </p>
            </div>
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-base hover:bg-bg-elevated text-xs font-black text-text-primary h-11 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
              >
                <Icons.Download className="w-4 h-4 text-text-secondary" />
                <span>Export My Data</span>
              </button>

              <button
                type="button"
                onClick={() => signOut(() => router.push('/'))}
                className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-base hover:bg-bg-elevated text-xs font-black text-text-primary h-11 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
              >
                <Icons.LogOut className="w-4 h-4 text-text-secondary" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="border-t border-dashed border-border-default pt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-600">Danger Zone</h4>
              <p className="text-xs text-text-secondary mt-1 font-semibold leading-relaxed">
                Permanently delete your account, gamification levels, logging histories, and all social connections. This action is irreversible.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="mt-3 w-full flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white h-11 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500/25"
              >
                <Icons.Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Modal Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border border-border-default bg-bg-surface p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-text-primary flex items-center gap-2">
              <Icons.AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Confirm Account Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary leading-relaxed mt-2 font-semibold">
              Are you absolutely sure you want to delete your Carbon Compass account? All your logged activities, carbon footprint achievements, streaks, and friendships will be deleted permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 cursor-pointer rounded-xl border border-border-default bg-bg-base hover:bg-bg-elevated px-4 py-2 text-xs font-bold text-text-primary h-10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
              className="flex-1 cursor-pointer rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white h-10 transition-colors flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Icons.Loader className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Icons.Trash2 className="w-3.5 h-3.5" />
                  Yes, Delete
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
