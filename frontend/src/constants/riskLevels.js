/**
 * Risk level styling and labels (shared across Flood Intelligence, DecisionPanel, etc.)
 */

export const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'];

/**
 * @param {string} level - Risk level label (e.g. 'critical', 'high')
 * @returns {string} Tailwind classes for badge
 */
export function getRiskBadgeClass(level) {
  const l = (level || '').toLowerCase();
  if (l === 'critical') return 'bg-red-500/20 text-red-400 border-red-500/40';
  if (l === 'high') return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
  if (l === 'moderate') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
}

/**
 * @param {number} score - Risk score 0–1
 * @returns {'critical'|'warning'|'advisory'|'normal'}
 */
export function getRiskVariant(score) {
  if (score >= 0.7) return 'critical';
  if (score >= 0.4) return 'warning';
  if (score >= 0.2) return 'advisory';
  return 'normal';
}

/**
 * @param {number} score - Risk score 0–1
 * @returns {string}
 */
export function getRiskLabel(score) {
  if (score >= 0.7) return 'Critical';
  if (score >= 0.4) return 'Warning';
  if (score >= 0.2) return 'Advisory';
  return 'Normal';
}
