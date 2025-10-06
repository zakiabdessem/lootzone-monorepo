'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import siteSettings from '@/lib/site-settings.json';

interface SiteSettings {
  siteName: string;
  currency: string;
  siteAnnouncementHtml: string;
  siteSubAnnouncement: string;
  supportEmail: string;
  whatsappNumber: string;
  whatsappLink: string;
  telegramLink: string;
  primaryColor?: string;
  accentColor?: string;
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  error: string | null;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ 
  children, 
  initialSettings 
}: { 
  children: React.ReactNode;
  initialSettings?: SiteSettings;
}) {
  const [settings, setSettings] = useState<SiteSettings>(
    initialSettings || siteSettings as SiteSettings
  );
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading: queryLoading, error: queryError } = api.siteSettings.get.useQuery(
    undefined,
    {
      enabled: typeof window !== 'undefined', // Only run on client
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  useEffect(() => {
    if (data) {
      setSettings(data as SiteSettings);
      setIsLoading(false);
      setError(null);
    } else if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
    } else if (!queryLoading && !initialSettings) {
      setIsLoading(false);
    }
  }, [data, queryError, queryLoading, initialSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

// Individual hooks for specific settings
export function useCurrency() {
  const { settings } = useSiteSettings();
  return settings.currency;
}

export function useAnnouncement() {
  const { settings } = useSiteSettings();
  return { html: settings.siteAnnouncementHtml };
}

export function useSiteSubAnnouncement() {
  const { settings } = useSiteSettings();
  return settings.siteSubAnnouncement;
}

export function useWhatsAppLink() {
  const { settings } = useSiteSettings();
  return settings.whatsappLink;
}

export function useTelegramLink() {
  const { settings } = useSiteSettings();
  return settings.telegramLink;
}

export function useSupportEmail() {
  const { settings } = useSiteSettings();
  return settings.supportEmail;
}

export function usePrimaryColor() {
  const { settings } = useSiteSettings();
  return settings.primaryColor || settings.theme?.primaryColor;
}

export function useAccentColor() {
  const { settings } = useSiteSettings();
  return settings.accentColor || settings.theme?.accentColor;
}
