const CODING_PROBLEMS = [
    {
        id: "two-sum",
        title: "Two Sum",
        category: "Problem Solving & Coding",
        difficulty: "Easy",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        starterCode: {
            python: "def two_sum(nums, target):\n    # Write your solution here\n    pass",
            javascript: "function twoSum(nums, target) {\n    // Write your solution here\n    return [];\n}",
            java: "import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
            cpp: "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}"
        },
        publicTestCases: [
            {
                id: 1,
                input: [[2, 7, 11, 15], 9],
                expectedOutput: [0, 1],
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                id: 2,
                input: [[3, 2, 4], 6],
                expectedOutput: [1, 2],
                explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
            },
            {
                id: 3,
                input: [[3, 3], 6],
                expectedOutput: [0, 1],
                explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
            }
        ],
        hiddenTestCases: [
            { id: 101, input: [[-1, -8, 10, 2], -6], expectedOutput: [0, 1], category: "normal" },
            { id: 102, input: [[0, 4, 3, 0], 0], expectedOutput: [0, 3], category: "edge_case" },
            { id: 103, input: [[1, 5, 8, 12, 19, 25, 30], 49], expectedOutput: [4, 6], category: "large_input" },
            { id: 104, input: [[-1000000000, 1000000000], 0], expectedOutput: [0, 1], category: "boundary" },
            { id: 105, input: [[10, 20, 30, 40, 50], 90], expectedOutput: [3, 4], category: "normal" }
        ]
    },
    {
        id: "valid-palindrome",
        title: "Valid Palindrome",
        category: "Problem Solving & Coding",
        difficulty: "Easy",
        description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        constraints: [
            "1 <= s.length <= 2 * 10^5",
            "s consists only of printable ASCII characters."
        ],
        starterCode: {
            python: "def solve(s):\n    # Write your solution here\n    pass",
            javascript: "function solve(s) {\n    // Write your solution here\n    return true;\n}",
            java: "public class Solution {\n    public static boolean solve(String s) {\n        // Write your solution here\n        return true;\n    }\n}",
            cpp: "#include <string>\nusing namespace std;\n\nbool solve(string s) {\n    // Write your solution here\n    return true;\n}"
        },
        publicTestCases: [
            {
                id: 1,
                input: ["A man, a plan, a canal: Panama"],
                expectedOutput: true,
                explanation: "\"amanaplanacanalpanama\" is a palindrome."
            },
            {
                id: 2,
                input: ["race a car"],
                expectedOutput: false,
                explanation: "\"raceacar\" is not a palindrome."
            }
        ],
        hiddenTestCases: [
            { id: 101, input: [" "], expectedOutput: true, category: "edge_case" },
            { id: 102, input: ["0P"], expectedOutput: false, category: "edge_case" },
            { id: 103, input: ["Was it a car or a cat I saw?"], expectedOutput: true, category: "normal" },
            { id: 104, input: ["ab_a"], expectedOutput: true, category: "boundary" }
        ]
    }
];

const getCodingProblemById = (id) => {
    return CODING_PROBLEMS.find(p => p.id === id) || CODING_PROBLEMS[0];
};

/**
 * Returns clean problem definition for frontend (stripping hidden test cases)
 */
const getPublicProblemDefinition = (problem) => {
    const { hiddenTestCases, ...publicData } = problem;
    return publicData;
};

module.exports = {
    CODING_PROBLEMS,
    getCodingProblemById,
    getPublicProblemDefinition
};
