import { AdminSettings } from '../types';

const getBaseUrl = () => {
  // Get the API server URL from environment or use localhost in development
  return process.env.API_URL || 'http://localhost:3000';
};

export const fetchSettings = async (): Promise<AdminSettings> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {} as AdminSettings;
  }
};

export const saveSettings = async (settings: AdminSettings): Promise<void> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setting: 'admin',
        value: settings
      }),
    });
    if (!response.ok) throw new Error('Failed to save settings');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/clear-history`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to clear history');
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

export const getDatabaseStats = async () => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/stats`);
    if (!response.ok) throw new Error('Failed to fetch database stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return null;
  }
};

export const backupDatabase = async (): Promise<void> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/backup`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to backup database');
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  }
};

export const resetDatabase = async (): Promise<void> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/reset`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset database');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};