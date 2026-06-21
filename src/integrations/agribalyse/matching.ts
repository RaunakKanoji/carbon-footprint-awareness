import type { AgribalyseMatchResult } from './types';

export function normalizeFoodName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s:-]/g, ' ')
    .replace(/\ben:/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(value: string) {
  return new Set(normalizeFoodName(value).split(' ').filter((word) => word.length > 2));
}

export function scoreFoodFactorMatch(input: {
  productTerms: string[];
  factorName: string;
  category?: string | null;
}) {
  const factorWords = words([input.factorName, input.category].filter(Boolean).join(' '));
  const productWords = words(input.productTerms.join(' '));
  if (factorWords.size === 0 || productWords.size === 0) return 0;

  const overlap = [...productWords].filter((word) => factorWords.has(word)).length;
  return overlap / Math.max(productWords.size, factorWords.size);
}

export function findBestAgribalyseMatch(
  matches: Array<{ id: string; name: string; category?: string | null; score: number }>,
): AgribalyseMatchResult {
  const best = [...matches].sort((a, b) => b.score - a.score)[0];
  if (!best || best.score < 0.75) {
    return {
      status: 'NO_RELIABLE_MATCH',
      score: best?.score,
      message: 'NO_RELIABLE_MATCH',
    };
  }

  return {
    status: 'MATCHED',
    confidence: 'LOW',
    score: best.score,
    factorId: best.id,
  };
}
