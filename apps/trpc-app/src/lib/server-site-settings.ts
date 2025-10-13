import { serverApi } from '~/trpc/server';
import siteSettings from './site-settings.json';

export async function getServerSiteSettings() {
  try {
    const settings = await serverApi.siteSettings.get();
    // Ensure we return a plain serializable object
    if (settings && typeof settings === 'object') {
      return JSON.parse(JSON.stringify(settings));
    }
    return siteSettings;
  } catch (error) {
    console.warn('Failed to fetch site settings from database, using fallback:', error);
    return siteSettings;
  }
}
