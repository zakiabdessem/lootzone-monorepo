import { serverApi } from '~/trpc/server';
import siteSettings from './site-settings.json';

export async function getServerSiteSettings() {
  try {
    const settings = await serverApi.siteSettings.get();
    return settings;
  } catch (error) {
    console.warn('Failed to fetch site settings from database, using fallback:', error);
    return siteSettings;
  }
}
