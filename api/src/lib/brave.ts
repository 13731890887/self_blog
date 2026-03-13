const braveBaseUrl = process.env.BRAVE_SEARCH_BASE_URL ?? 'https://api.search.brave.com/res/v1/web/search';

export function hasBraveConfig() {
  return Boolean(process.env.BRAVE_SEARCH_API_KEY);
}

export async function searchBrave(query: string, count = 5) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return [];
  }

  const url = new URL(braveBaseUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('search_lang', 'en');
  url.searchParams.set('safesearch', 'moderate');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Brave Search failed with ${response.status}`);
  }

  const data = await response.json() as {
    web?: {
      results?: Array<{
        title?: string;
        url?: string;
        description?: string;
      }>;
    };
  };

  return (data.web?.results ?? []).map((item) => ({
    title: item.title ?? 'Untitled result',
    href: item.url ?? '',
    excerpt: item.description ?? '',
    source: 'brave'
  })).filter((item) => item.href);
}
