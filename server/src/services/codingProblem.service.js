const problems = require('../data/codingProblems');

/**
 * Get a random problem by difficulty, avoiding previously used problem IDs.
 */
const getProblemByDifficulty = (difficulty = 'Medium', usedProblemIds = []) => {
  const normalizedDiff = (difficulty || 'Medium').trim().toLowerCase();
  
  const matching = problems.filter(p => 
    p.difficulty.toLowerCase() === normalizedDiff && !usedProblemIds.includes(p.id)
  );

  if (matching.length === 0) {
    // All used — reset and pick from all matching difficulty
    const all = problems.filter(p => p.difficulty.toLowerCase() === normalizedDiff);
    if (all.length === 0) return problems[0];
    return all[Math.floor(Math.random() * all.length)];
  }

  return matching[Math.floor(Math.random() * matching.length)];
};

/**
 * Get a problem by ID (for restoring state). Returns null if not found.
 */
const getProblemById = (id) => {
  if (!id) return null;
  // Match by id or legacy alias
  return problems.find(p => p.id === id || (id === 'two-sum' && p.id === 'prob_001')) || null;
};

/**
 * Get a safe version for the frontend — strips hiddenTestCases and any solution fields.
 */
const getSafeProblemForFrontend = (problem) => {
  if (!problem) return null;
  const { hiddenTestCases, ...safe } = problem;
  return safe;
};

module.exports = {
  problems,
  getProblemByDifficulty,
  getProblemById,
  getSafeProblemForFrontend
};
