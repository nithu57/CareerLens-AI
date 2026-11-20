import axios from 'axios';

export async function searchYouTubeTutorials(query: string, maxResults: number = 6) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return {
      isConfigured: false,
      message: 'YOUTUBE_API_KEY is not set in Firebase Secret Manager.',
      resources: [],
    };
  }

  try {
    const endpoint = 'https://www.googleapis.com/youtube/v3/search';
    const response = await axios.get(endpoint, {
      params: {
        part: 'snippet',
        q: `${query} tutorial course`,
        type: 'video',
        videoCategoryId: '27', // Education category
        maxResults,
        key: apiKey,
      },
      timeout: 8000,
    });

    const items = response.data?.items || [];
    const resources = items.map((item: any) => ({
      id: `yt-${item.id?.videoId}`,
      title: item.snippet?.title || 'Tutorial',
      provider: 'YouTube',
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      topic: query,
      type: 'video',
      channelTitle: item.snippet?.channelTitle,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
    }));

    return {
      isConfigured: true,
      resources,
    };
  } catch (error: any) {
    console.error('YouTube Data API error:', error?.message);
    return {
      isConfigured: true,
      error: error?.message,
      resources: [],
    };
  }
}
