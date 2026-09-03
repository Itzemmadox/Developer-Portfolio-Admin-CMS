import { Testimonial } from '../types';

export interface SatisfactionResult {
  averageRating: number;
  percentage: number;
  percentageString: string;
  starString: string;
  count: number;
  totalStars: number;
  maxStars: number;
  breakdown: string;
}

/**
 * Calculates client satisfaction score from all live testimonials.
 * Formula: (Average Rating ÷ 5) × 100 = Satisfaction Percentage.
 * Example:
 *  - 1 star + 5 stars = 6 / 10 stars -> Average = 3.0 / 5 -> 60%
 *  - 5 stars + 5 stars = 10 / 10 stars -> Average = 5.0 / 5 -> 100%
 */
export function calculateSatisfaction(testimonials: Testimonial[] = []): SatisfactionResult {
  if (!testimonials || testimonials.length === 0) {
    return {
      averageRating: 5.0,
      percentage: 100,
      percentageString: '100%',
      starString: '5.0 ★',
      count: 0,
      totalStars: 0,
      maxStars: 0,
      breakdown: '100% (Prerelease baseline)'
    };
  }

  let totalStars = 0;
  let count = 0;

  for (const t of testimonials) {
    const rawRating = typeof t.rating === 'number' && !isNaN(t.rating) ? t.rating : 5;
    const clamped = Math.max(1, Math.min(5, rawRating));
    totalStars += clamped;
    count++;
  }

  if (count === 0) {
    return {
      averageRating: 5.0,
      percentage: 100,
      percentageString: '100%',
      starString: '5.0 ★',
      count: 0,
      totalStars: 0,
      maxStars: 0,
      breakdown: '100% (Prerelease baseline)'
    };
  }

  const avg = totalStars / count;
  const pct = Math.round((avg / 5) * 100);
  const formattedAvg = avg % 1 === 0 ? avg.toFixed(1) : avg.toFixed(1);

  return {
    averageRating: avg,
    percentage: pct,
    percentageString: `${pct}%`,
    starString: `${formattedAvg} ★`,
    count,
    totalStars,
    maxStars: count * 5,
    breakdown: `${formattedAvg} / 5 ★ (${count} ${count === 1 ? 'review' : 'reviews'})`
  };
}

/**
 * Resolves the display value and label for the About page Client Rating stat.
 * If override is empty, 'auto', or 'auto:percentage', it returns the calculated percentage (e.g. "60%").
 * If override is 'auto:stars', it returns the star rating (e.g. "3.0 ★").
 * Otherwise, returns the custom override text verbatim (e.g. "99%", "5.0 ★").
 */
export function resolveClientRatingDisplay(
  override: string | undefined,
  testimonials: Testimonial[] = []
): {
  value: string;
  isAuto: boolean;
  satisfaction: SatisfactionResult;
  tooltip: string;
} {
  const satisfaction = calculateSatisfaction(testimonials);
  const trimmed = override?.trim() || '';
  const lower = trimmed.toLowerCase();

  const isAuto = !trimmed || lower === 'auto' || lower === 'auto:percentage' || lower === 'auto:stars';

  let value = '100%';
  if (isAuto) {
    if (lower === 'auto:stars') {
      value = satisfaction.starString;
    } else {
      value = satisfaction.percentageString;
    }
  } else {
    value = trimmed;
  }

  const tooltip = isAuto
    ? `Based on ${satisfaction.count} client ${satisfaction.count === 1 ? 'review' : 'reviews'} (${satisfaction.totalStars}/${satisfaction.maxStars} stars)`
    : `Custom rating override: ${trimmed}`;

  return {
    value,
    isAuto,
    satisfaction,
    tooltip
  };
}
