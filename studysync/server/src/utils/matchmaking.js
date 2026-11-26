function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function jaccardSimilarity(arrA, arrB) {
  const mapA = new Map();
  for (const item of arrA) {
    if (typeof item === 'string' && item.trim()) {
      mapA.set(item.trim().toLowerCase(), item.trim());
    }
  }

  const mapB = new Map();
  for (const item of arrB) {
    if (typeof item === 'string' && item.trim()) {
      mapB.set(item.trim().toLowerCase(), item.trim());
    }
  }

  if (mapA.size === 0 && mapB.size === 0) {
    return { similarity: 0, shared: [] };
  }

  const shared = [];
  for (const [key, label] of mapA.entries()) {
    if (mapB.has(key)) {
      shared.push(label);
    }
  }

  const unionSize = new Set([...mapA.keys(), ...mapB.keys()]).size;
  const similarity = unionSize === 0 ? 0 : shared.length / unionSize;

  return { similarity, shared };
}

/**
 * Calculate compatibility score (0-100) and human-readable reasons between two users.
 * Weights:
 * - Shared subjects: 35% (Jaccard * 35)
 * - Shared interests: 25% (Jaccard * 25)
 * - Shared goals: 20% (Jaccard * 20)
 * - Availability overlap: 15% (Jaccard * 15)
 * - Same course bonus: +5%
 */
function calculateCompatibility(userA, userB) {
  const subjectsA = parseJsonArray(userA.subjects);
  const subjectsB = parseJsonArray(userB.subjects);
  const interestsA = parseJsonArray(userA.interests);
  const interestsB = parseJsonArray(userB.interests);
  const goalsA = parseJsonArray(userA.goals);
  const goalsB = parseJsonArray(userB.goals);
  const availA = parseJsonArray(userA.availability);
  const availB = parseJsonArray(userB.availability);

  const subMatch = jaccardSimilarity(subjectsA, subjectsB);
  const intMatch = jaccardSimilarity(interestsA, interestsB);
  const goalMatch = jaccardSimilarity(goalsA, goalsB);
  const availMatch = jaccardSimilarity(availA, availB);

  let rawScore =
    subMatch.similarity * 35 +
    intMatch.similarity * 25 +
    goalMatch.similarity * 20 +
    availMatch.similarity * 15;

  const sameCourse =
    userA.course &&
    userB.course &&
    userA.course.trim().toLowerCase() === userB.course.trim().toLowerCase();

  if (sameCourse) {
    rawScore += 5;
  }

  const score = Math.min(100, Math.round(rawScore));
  const reasons = [];

  if (subMatch.shared.length > 0) {
    reasons.push(
      `${subMatch.shared.length} shared subject${subMatch.shared.length > 1 ? 's' : ''}: ${subMatch.shared.join(', ')}`
    );
  }
  if (intMatch.shared.length > 0) {
    reasons.push(
      `${intMatch.shared.length} shared interest${intMatch.shared.length > 1 ? 's' : ''}: ${intMatch.shared.join(', ')}`
    );
  }
  if (goalMatch.shared.length > 0) {
    reasons.push(
      `${goalMatch.shared.length} shared goal${goalMatch.shared.length > 1 ? 's' : ''}: ${goalMatch.shared.join(', ')}`
    );
  }
  if (availMatch.shared.length > 0) {
    reasons.push(
      `${availMatch.shared.length} overlapping availability slot${availMatch.shared.length > 1 ? 's' : ''}: ${availMatch.shared.join(', ')}`
    );
  }
  if (sameCourse) {
    reasons.push(`Same course: ${userB.course}`);
  }

  return {
    score,
    reasons,
    breakdown: {
      subjects: { count: subMatch.shared.length, items: subMatch.shared },
      interests: { count: intMatch.shared.length, items: intMatch.shared },
      goals: { count: goalMatch.shared.length, items: goalMatch.shared },
      availability: { count: availMatch.shared.length, items: availMatch.shared },
      same_course: Boolean(sameCourse)
    }
  };
}

module.exports = { calculateCompatibility, parseJsonArray };
