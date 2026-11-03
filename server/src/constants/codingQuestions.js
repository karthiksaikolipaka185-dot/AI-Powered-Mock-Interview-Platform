const { problems, getProblemById, getSafeProblemForFrontend } = require('../services/codingProblem.service');

const CODING_PROBLEMS = problems;

const getCodingProblemById = (id) => {
    return getProblemById(id) || CODING_PROBLEMS[0];
};

/**
 * Returns clean problem definition for frontend (stripping hidden test cases)
 */
const getPublicProblemDefinition = (problem) => {
    return getSafeProblemForFrontend(problem);
};

module.exports = {
    CODING_PROBLEMS,
    getCodingProblemById,
    getPublicProblemDefinition
};
