export function parseGoogleMapsLink(url: string) {
  try {
    const parsed = new URL(url);

    const isGoogleMaps =
      parsed.hostname.includes('google.com') ||
      parsed.hostname.includes('maps.app.goo.gl') ||
      parsed.hostname.includes('goo.gl');

    if (!isGoogleMaps) {
      throw new Error('Not a Google Maps URL');
    }

    const path = decodeURIComponent(parsed.pathname);

    // E.g. https://www.google.com/maps/dir/Andheri+West/BKC+Mumbai
    if (path.includes('/dir/')) {
      const parts = path.split('/dir/')[1]?.split('/').filter(Boolean) ?? [];

      return {
        type: 'directions' as const,
        originText: parts[0]?.replaceAll('+', ' '),
        destinationText: parts[1]?.replaceAll('+', ' '),
        rawUrl: url,
      };
    }

    // E.g. https://maps.google.com/?q=BKC+Mumbai
    const q = parsed.searchParams.get('q');
    if (q) {
      return {
        type: 'place' as const,
        placeText: q,
        rawUrl: url,
      };
    }

    return {
      type: 'unknown' as const,
      rawUrl: url,
    };
  } catch {
    throw new Error('Invalid Google Maps URL');
  }
}
