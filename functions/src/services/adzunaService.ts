import axios from 'axios';

export interface AdzunaSearchParams {
  role?: string;
  location?: string;
  keywords?: string;
  page?: number;
  country?: string; // defaults to 'in'
}

export async function fetchAdzunaJobs(params: AdzunaSearchParams) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return {
      isConfigured: false,
      message: 'ADZUNA_APP_ID and ADZUNA_APP_KEY are not set in Firebase Secret Manager.',
      jobs: [],
      total: 0,
    };
  }

  const country = params.country || 'in';
  const page = params.page || 1;
  const what = [params.role, params.keywords].filter(Boolean).join(' ');
  const where = params.location || '';

  const endpoint = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;

  try {
    const response = await axios.get(endpoint, {
      params: {
        app_id: appId,
        app_key: appKey,
        what,
        where,
        results_per_page: 20,
        content_type: 'application/json',
      },
      timeout: 10000,
    });

    const results = response.data?.results || [];
    const formattedJobs = results.map((item: any) => ({
      id: `adzuna-${item.id}`,
      title: item.title?.replace(/<\/?[^>]+(>|$)/g, '') || 'Software Engineering Role',
      company: item.company?.display_name || 'Technology Company',
      location: item.location?.display_name || 'India',
      salary: item.salary_min
        ? `₹${Math.round(item.salary_min).toLocaleString()} - ₹${Math.round(item.salary_max || item.salary_min * 1.5).toLocaleString()} / yr`
        : null,
      description: item.description?.replace(/<\/?[^>]+(>|$)/g, '') || '',
      redirectUrl: item.redirect_url,
      provider: 'Adzuna',
      postedDate: item.created,
      retrievedAt: new Date().toISOString(),
      contractType: item.contract_time || 'Full Time',
    }));

    return {
      isConfigured: true,
      jobs: formattedJobs,
      total: response.data?.count || formattedJobs.length,
    };
  } catch (error: any) {
    console.error('Adzuna API request error:', error?.message);
    return {
      isConfigured: true,
      error: error?.message || 'Failed to query Adzuna API',
      jobs: [],
      total: 0,
    };
  }
}
