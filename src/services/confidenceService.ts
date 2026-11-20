import { auth } from '@/lib/firebase';
import { ConfidenceScoreData, ConfidenceScoreHistoryItem } from '@/types';

const getBackendBaseUrl = (): string => {
  return import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001';
};

/**
 * Gets authentication headers containing Firebase ID Token or dev token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        return headers;
      }
    } catch (e) {
      console.warn('[ConfidenceService] Failed to get Firebase ID token:', e);
    }

    // Dev fallback if token generation fails locally
    const devPayload = btoa(
      JSON.stringify({
        user_id: currentUser.uid,
        email: currentUser.email || '',
        name: currentUser.displayName || '',
      })
    );
    headers['Authorization'] = `Bearer eyJhbGciOiJub25lIn0.${devPayload}.`;
  }

  return headers;
}

/**
 * Fetches the user's latest Confidence Score from MongoDB via the MERN backend API.
 */
export async function getConfidenceScore(): Promise<ConfidenceScoreData | null> {
  try {
    const baseUrl = getBackendBaseUrl();
    const headers = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/api/confidence-score`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch confidence score (${response.status})`);
    }

    const result = await response.json();
    return result.data as ConfidenceScoreData;
  } catch (error) {
    console.error('[ConfidenceService] Error fetching confidence score:', error);
    return null;
  }
}

/**
 * Requests the backend to recalculate the user's Confidence Score based on latest
 * MongoDB data (skills, resume analysis, roadmap progress, interview practice).
 */
export async function recalculateConfidenceScore(): Promise<ConfidenceScoreData | null> {
  try {
    const baseUrl = getBackendBaseUrl();
    const headers = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/api/confidence-score/calculate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate confidence score (${response.status})`);
    }

    const result = await response.json();
    return result.data as ConfidenceScoreData;
  } catch (error) {
    console.error('[ConfidenceService] Error calculating confidence score:', error);
    return null;
  }
}

/**
 * Fetches the user's score history snapshots from MongoDB.
 */
export async function getConfidenceScoreHistory(): Promise<ConfidenceScoreHistoryItem[]> {
  try {
    const baseUrl = getBackendBaseUrl();
    const headers = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/api/confidence-score/history`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch score history (${response.status})`);
    }

    const result = await response.json();
    return (result.data || []) as ConfidenceScoreHistoryItem[];
  } catch (error) {
    console.error('[ConfidenceService] Error fetching score history:', error);
    return [];
  }
}
