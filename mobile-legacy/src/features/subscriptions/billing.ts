import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});
const ENTITLEMENT = 'pro';
let configuredFor: string | null = null;

export const isBillingConfigured = Boolean(apiKey && !apiKey.includes('your_')) && Platform.OS !== 'web';

async function configureBilling(userId?: string) {
  if (!isBillingConfigured || !apiKey) throw new Error('Store billing is not configured for this build. Add the RevenueCat public SDK key and create a development build.');
  if (configuredFor !== apiKey) {
    Purchases.configure({ apiKey, appUserID: userId });
    configuredFor = apiKey;
  } else if (userId) {
    await Purchases.logIn(userId);
  }
}

export async function purchasePro(userId?: string) {
  await configureBilling(userId);
  const offerings = await Purchases.getOfferings();
  const selected = offerings.current?.annual ?? offerings.current?.availablePackages[0];
  if (!selected) throw new Error('No RevenueCat package is available. Publish an offering with a Pro package first.');
  const { customerInfo } = await Purchases.purchasePackage(selected);
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}

export async function restorePro(userId?: string) {
  await configureBilling(userId);
  const customerInfo = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}

export async function getProEntitlement(userId?: string) {
  await configureBilling(userId);
  const customerInfo = await Purchases.getCustomerInfo();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}
