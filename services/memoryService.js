const DB_SERVER = process.env.DB_SERVER || 'http://localhost:3001';

// Function to store a search query
export const storeSearchQuery = async (query) => {
  try {
    const response = await fetch(`${DB_SERVER}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to store search query');
    return await response.json();
  } catch (error) {
    console.error('Error storing search query:', error);
    throw error;
  }
};

// Function to retrieve past searches
export const getSearchHistory = async () => {
  try {
    const response = await fetch(`${DB_SERVER}/api/history`);
    if (!response.ok) throw new Error('Failed to fetch search history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};

// Function to mark an HTS code as expired
export const markHTSCodeAsExpired = async (code) => {
  try {
    const response = await fetch(`${DB_SERVER}/api/htscodes/${code}/expire`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark HTS code as expired');
    return await response.json();
  } catch (error) {
    console.error('Error marking HTS code as expired:', error);
    throw error;
  }
};

// Function to check if an HTS code is expired
export const isHTSCodeExpired = async (code) => {
  try {
    const response = await fetch(`${DB_SERVER}/api/htscodes/${code}`);
    if (!response.ok) throw new Error('Failed to check HTS code status');
    const result = await response.json();
    return result ? result.isExpired === 1 : false;
  } catch (error) {
    console.error('Error checking HTS code status:', error);
    return false;
  }
};