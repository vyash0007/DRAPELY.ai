'use client';

import { useState, useEffect } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { updateUserAiEnabled, updateUserPremiumStatus } from '@/actions/admin-customers';
import { useRouter } from 'next/navigation';

interface CustomerTogglesProps {
  userId: string;
  aiEnabled: boolean;
  hasPremium: boolean;
}

export function CustomerToggles({ userId, aiEnabled: initialAiEnabled, hasPremium: initialHasPremium }: CustomerTogglesProps) {
  const router = useRouter();
  const [aiEnabled, setAiEnabled] = useState(initialAiEnabled);
  const [hasPremium, setHasPremium] = useState(initialHasPremium);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync with props when they change
  useEffect(() => {
    setAiEnabled(initialAiEnabled);
    setHasPremium(initialHasPremium);
  }, [initialAiEnabled, initialHasPremium]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAiToggle = async (checked: boolean) => {
    // If premium is enabled, don't allow disabling AI
    if (hasPremium && !checked) {
      setError('Cannot disable AI when Premium is enabled');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await updateUserAiEnabled(userId, checked);
      if (result.success) {
        setAiEnabled(checked);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update AI status');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumToggle = async (checked: boolean) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await updateUserPremiumStatus(userId, checked);
      if (result.success) {
        setHasPremium(checked);
        // If premium is enabled, AI is automatically enabled
        if (checked) {
          setAiEnabled(true);
        }
        router.refresh();
      } else {
        setError(result.error || 'Failed to update Premium status');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      <Toggle
        checked={aiEnabled}
        onCheckedChange={handleAiToggle}
        disabled={loading || hasPremium}
        label="AI Try-On Enabled"
        description={hasPremium ? "Enabled with Premium subscription" : "Free trial access to AI try-on feature"}
      />
      
      <div className="pt-2 border-t border-gray-200">
        <Toggle
          checked={hasPremium}
          onCheckedChange={handlePremiumToggle}
          disabled={loading}
          label="Premium Subscription"
          description="Premium subscription includes AI try-on and other premium features"
        />
      </div>
    </div>
  );
}

