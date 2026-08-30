import { PropsWithChildren, useEffect } from 'react';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getProEntitlement, isBillingConfigured } from './billing';
import { useAppStore } from '@/src/store/useAppStore';

export function SubscriptionEntitlementProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const activatePro = useAppStore((state) => state.activatePro);
  useEffect(() => {
    if (!isBillingConfigured) return;
    let cancelled = false;
    void getProEntitlement(session?.user.id).then((active) => {
      if (active && !cancelled) activatePro();
    }).catch((error) => console.warn('RevenueCat entitlement refresh failed', error));
    return () => { cancelled = true; };
  }, [activatePro, session?.user.id]);
  return children;
}
