/**
 * Coding Problem Bank
 * Contains 30 unique algorithm & data structure interview problems
 * (10 Easy, 10 Medium, 10 Hard)
 */

const CODING_PROBLEMS = [
  {
    "id": "prob_001",
    "title": "Two Sum",
    "difficulty": "Easy",
    "topic": "Hash Map",
    "functionName": {
      "python": "two_sum",
      "javascript": "twoSum",
      "java": "twoSum",
      "cpp": "twoSum"
    },
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    "inputFormat": "First line: JSON array of integers (nums)\nSecond line: integer (target)",
    "outputFormat": "JSON array of two integers representing indices [index1, index2]",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        "input": "nums = [3,2,4], target = 6",
        "output": "[1,2]",
        "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "starterCode": {
      "python": "def two_sum(nums, target):\n    # Write your solution here\n    pass",
      "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[2,7,11,15]\n9",
        "expectedOutput": "[0,1]",
        "description": "Basic case"
      },
      {
        "id": "pub_2",
        "input": "[3,2,4]\n6",
        "expectedOutput": "[1,2]",
        "description": "Non-adjacent elements"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[3,3]\n6",
        "expectedOutput": "[0,1]"
      },
      {
        "id": "hid_2",
        "input": "[-1,-2,-3,-4,-5]\n-8",
        "expectedOutput": "[2,4]"
      },
      {
        "id": "hid_3",
        "input": "[1000000000,999999999]\n1999999999",
        "expectedOutput": "[0,1]"
      },
      {
        "id": "hid_4",
        "input": "[0,4,3,0]\n0",
        "expectedOutput": "[0,3]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_002",
    "title": "Reverse String",
    "difficulty": "Easy",
    "topic": "Strings",
    "functionName": {
      "python": "reverse_string",
      "javascript": "reverseString",
      "java": "reverseString",
      "cpp": "reverseString"
    },
    "description": "Write a function that reverses a given string. The input string is given as a string s, and the function should return the reversed string.",
    "inputFormat": "Single line: a string s",
    "outputFormat": "The reversed string",
    "examples": [
      {
        "input": "s = \"hello\"",
        "output": "\"olleh\"",
        "explanation": "The reverse of \"hello\" is \"olleh\"."
      },
      {
        "input": "s = \"Hannah\"",
        "output": "\"hannaH\"",
        "explanation": "The reverse of \"Hannah\" is \"hannaH\"."
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5",
      "s consists of printable ASCII characters."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "starterCode": {
      "python": "def reverse_string(s):\n    # Write your solution here\n    pass",
      "javascript": "function reverseString(s) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public String reverseString(String s) {\n        // Write your solution here\n        return \"\";\n    }\n}",
      "cpp": "class Solution {\npublic:\n    string reverseString(string s) {\n        // Write your solution here\n        return \"\";\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"hello\"",
        "expectedOutput": "\"olleh\"",
        "description": "Standard lowercase word"
      },
      {
        "id": "pub_2",
        "input": "\"Hannah\"",
        "expectedOutput": "\"hannaH\"",
        "description": "Mixed case word"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"a\"",
        "expectedOutput": "\"a\""
      },
      {
        "id": "hid_2",
        "input": "\"racecar\"",
        "expectedOutput": "\"racecar\""
      },
      {
        "id": "hid_3",
        "input": "\"Antigravity AI\"",
        "expectedOutput": "\"IA ytivargitnA\""
      },
      {
        "id": "hid_4",
        "input": "\"1234567890\"",
        "expectedOutput": "\"0987654321\""
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_003",
    "title": "Valid Parentheses",
    "difficulty": "Easy",
    "topic": "Stack",
    "functionName": {
      "python": "is_valid",
      "javascript": "isValid",
      "java": "isValid",
      "cpp": "isValid"
    },
    "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    "inputFormat": "Single line: string s",
    "outputFormat": "Boolean true or false",
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true",
        "explanation": "Single matched pair of parentheses."
      },
      {
        "input": "s = \"()[]{}\"",
        "output": "true",
        "explanation": "All three bracket types open and close correctly."
      },
      {
        "input": "s = \"(]\"",
        "output": "false",
        "explanation": "Parenthesis closed by a square bracket is invalid."
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only: ()[]{}"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "starterCode": {
      "python": "def is_valid(s):\n    # Write your solution here\n    pass",
      "javascript": "function isValid(s) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"()\"",
        "expectedOutput": "true",
        "description": "Simple pair"
      },
      {
        "id": "pub_2",
        "input": "\"()[]{}\"",
        "expectedOutput": "true",
        "description": "Consecutive pairs"
      },
      {
        "id": "pub_3",
        "input": "\"(]\"",
        "expectedOutput": "false",
        "description": "Mismatched pair"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"([)]\"",
        "expectedOutput": "false"
      },
      {
        "id": "hid_2",
        "input": "\"{[]}\"",
        "expectedOutput": "true"
      },
      {
        "id": "hid_3",
        "input": "\"(((\"",
        "expectedOutput": "false"
      },
      {
        "id": "hid_4",
        "input": "\"]\"",
        "expectedOutput": "false"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_004",
    "title": "Palindrome Number",
    "difficulty": "Easy",
    "topic": "Math",
    "functionName": {
      "python": "is_palindrome",
      "javascript": "isPalindrome",
      "java": "isPalindrome",
      "cpp": "isPalindrome"
    },
    "description": "Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward. For example, 121 is a palindrome while 123 is not.",
    "inputFormat": "Single line: integer x",
    "outputFormat": "Boolean true or false",
    "examples": [
      {
        "input": "x = 121",
        "output": "true",
        "explanation": "121 reads as 121 from left to right and from right to left."
      },
      {
        "input": "x = -121",
        "output": "false",
        "explanation": "From left to right, it reads -121. From right to left it becomes 121-, so not a palindrome."
      }
    ],
    "constraints": [
      "-2^31 <= x <= 2^31 - 1"
    ],
    "timeComplexity": "O(log10(n))",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def is_palindrome(x):\n    # Write your solution here\n    pass",
      "javascript": "function isPalindrome(x) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your solution here\n        return false;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Write your solution here\n        return false;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "121",
        "expectedOutput": "true",
        "description": "Positive palindrome"
      },
      {
        "id": "pub_2",
        "input": "-121",
        "expectedOutput": "false",
        "description": "Negative integer"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "10",
        "expectedOutput": "false"
      },
      {
        "id": "hid_2",
        "input": "0",
        "expectedOutput": "true"
      },
      {
        "id": "hid_3",
        "input": "12321",
        "expectedOutput": "true"
      },
      {
        "id": "hid_4",
        "input": "1000021",
        "expectedOutput": "false"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_005",
    "title": "Maximum Subarray (Kadane's)",
    "difficulty": "Easy",
    "topic": "Arrays",
    "functionName": {
      "python": "max_sub_array",
      "javascript": "maxSubArray",
      "java": "maxSubArray",
      "cpp": "maxSubArray"
    },
    "description": "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    "inputFormat": "Single line: JSON array of integers (nums)",
    "outputFormat": "Integer representing maximum subarray sum",
    "examples": [
      {
        "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        "output": "6",
        "explanation": "Subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        "input": "nums = [1]",
        "output": "1",
        "explanation": "Single element array sum is 1."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def max_sub_array(nums):\n    # Write your solution here\n    pass",
      "javascript": "function maxSubArray(nums) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[-2,1,-3,4,-1,2,1,-5,4]",
        "expectedOutput": "6",
        "description": "Mixed positive and negative"
      },
      {
        "id": "pub_2",
        "input": "[1]",
        "expectedOutput": "1",
        "description": "Single element"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[5,4,-1,7,8]",
        "expectedOutput": "23"
      },
      {
        "id": "hid_2",
        "input": "[-1]",
        "expectedOutput": "-1"
      },
      {
        "id": "hid_3",
        "input": "[-2,-1]",
        "expectedOutput": "-1"
      },
      {
        "id": "hid_4",
        "input": "[-5,-2,-3]",
        "expectedOutput": "-2"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_006",
    "title": "Merge Two Sorted Arrays",
    "difficulty": "Easy",
    "topic": "Two Pointers",
    "functionName": {
      "python": "merge_sorted_arrays",
      "javascript": "mergeSortedArrays",
      "java": "mergeSortedArrays",
      "cpp": "mergeSortedArrays"
    },
    "description": "You are given two integer arrays nums1 and nums2, both sorted in non-decreasing order. Merge nums1 and nums2 into a single array sorted in non-decreasing order and return it.",
    "inputFormat": "First line: JSON array nums1\nSecond line: JSON array nums2",
    "outputFormat": "JSON array of merged integers",
    "examples": [
      {
        "input": "nums1 = [1,3,5], nums2 = [2,4,6]",
        "output": "[1,2,3,4,5,6]",
        "explanation": "Merged sorted sequence."
      },
      {
        "input": "nums1 = [1,2,3], nums2 = []",
        "output": "[1,2,3]",
        "explanation": "Empty second array."
      }
    ],
    "constraints": [
      "0 <= nums1.length, nums2.length <= 10^4",
      "-10^9 <= nums1[i], nums2[i] <= 10^9"
    ],
    "timeComplexity": "O(n + m)",
    "spaceComplexity": "O(n + m)",
    "starterCode": {
      "python": "def merge_sorted_arrays(nums1, nums2):\n    # Write your solution here\n    pass",
      "javascript": "function mergeSortedArrays(nums1, nums2) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int[] mergeSortedArrays(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> mergeSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,3,5]\n[2,4,6]",
        "expectedOutput": "[1,2,3,4,5,6]",
        "description": "Interleaved arrays"
      },
      {
        "id": "pub_2",
        "input": "[1,2,3]\n[]",
        "expectedOutput": "[1,2,3]",
        "description": "Empty second array"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[]\n[1]",
        "expectedOutput": "[1]"
      },
      {
        "id": "hid_2",
        "input": "[0]\n[0]",
        "expectedOutput": "[0,0]"
      },
      {
        "id": "hid_3",
        "input": "[-5,2,8]\n[-3,1,9]",
        "expectedOutput": "[-5,-3,1,2,8,9]"
      },
      {
        "id": "hid_4",
        "input": "[1,1,1]\n[1,1]",
        "expectedOutput": "[1,1,1,1,1]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_007",
    "title": "Count Vowels in String",
    "difficulty": "Easy",
    "topic": "Strings",
    "functionName": {
      "python": "count_vowels",
      "javascript": "countVowels",
      "java": "countVowels",
      "cpp": "countVowels"
    },
    "description": "Given a string s, return the total count of vowels ('a', 'e', 'i', 'o', 'u', both lowercase and uppercase) present in the string.",
    "inputFormat": "Single line: string s",
    "outputFormat": "Integer representing count of vowels",
    "examples": [
      {
        "input": "s = \"hello world\"",
        "output": "3",
        "explanation": "Vowels are 'e', 'o', 'o'."
      },
      {
        "input": "s = \"AEIOU\"",
        "output": "5",
        "explanation": "All 5 characters are uppercase vowels."
      }
    ],
    "constraints": [
      "0 <= s.length <= 10^5",
      "s consists of printable ASCII characters."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def count_vowels(s):\n    # Write your solution here\n    pass",
      "javascript": "function countVowels(s) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int countVowels(String s) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int countVowels(string s) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"hello world\"",
        "expectedOutput": "3",
        "description": "Lowercase sentence"
      },
      {
        "id": "pub_2",
        "input": "\"AEIOU\"",
        "expectedOutput": "5",
        "description": "Uppercase vowels"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"rhythm\"",
        "expectedOutput": "0"
      },
      {
        "id": "hid_2",
        "input": "\"\"",
        "expectedOutput": "0"
      },
      {
        "id": "hid_3",
        "input": "\"The Quick Brown Fox Jumps Over The Lazy Dog\"",
        "expectedOutput": "11"
      },
      {
        "id": "hid_4",
        "input": "\"12345!@#$%\"",
        "expectedOutput": "0"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_008",
    "title": "Find Missing Number",
    "difficulty": "Easy",
    "topic": "Math/XOR",
    "functionName": {
      "python": "missing_number",
      "javascript": "missingNumber",
      "java": "missingNumber",
      "cpp": "missingNumber"
    },
    "description": "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    "inputFormat": "Single line: JSON array of distinct integers nums",
    "outputFormat": "Integer missing from the sequence",
    "examples": [
      {
        "input": "nums = [3,0,1]",
        "output": "2",
        "explanation": "n = 3, range is [0,3]. 2 is missing."
      },
      {
        "input": "nums = [0,1]",
        "output": "2",
        "explanation": "n = 2, range is [0,2]. 2 is missing."
      }
    ],
    "constraints": [
      "n == nums.length",
      "1 <= n <= 10^4",
      "0 <= nums[i] <= n",
      "All numbers in nums are unique."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def missing_number(nums):\n    # Write your solution here\n    pass",
      "javascript": "function missingNumber(nums) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int missingNumber(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[3,0,1]",
        "expectedOutput": "2",
        "description": "Missing in middle"
      },
      {
        "id": "pub_2",
        "input": "[0,1]",
        "expectedOutput": "2",
        "description": "Missing at end"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[9,6,4,2,3,5,7,0,1]",
        "expectedOutput": "8"
      },
      {
        "id": "hid_2",
        "input": "[0]",
        "expectedOutput": "1"
      },
      {
        "id": "hid_3",
        "input": "[1]",
        "expectedOutput": "0"
      },
      {
        "id": "hid_4",
        "input": "[2,0]",
        "expectedOutput": "1"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_009",
    "title": "Remove Duplicates from Sorted Array",
    "difficulty": "Easy",
    "topic": "Two Pointers",
    "functionName": {
      "python": "remove_duplicates",
      "javascript": "removeDuplicates",
      "java": "removeDuplicates",
      "cpp": "removeDuplicates"
    },
    "description": "Given an integer array nums sorted in non-decreasing order, remove duplicates in-place such that each unique element appears only once and return the array of unique elements in sorted order.",
    "inputFormat": "Single line: JSON array of sorted integers nums",
    "outputFormat": "JSON array containing the unique elements",
    "examples": [
      {
        "input": "nums = [1,1,2]",
        "output": "[1,2]",
        "explanation": "Unique elements are [1, 2]."
      },
      {
        "input": "nums = [0,0,1,1,1,2,2,3,3,4]",
        "output": "[0,1,2,3,4]",
        "explanation": "Unique elements are [0, 1, 2, 3, 4]."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 3 * 10^4",
      "-100 <= nums[i] <= 100",
      "nums is sorted in non-decreasing order."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def remove_duplicates(nums):\n    # Write your solution here\n    pass",
      "javascript": "function removeDuplicates(nums) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int[] removeDuplicates(int[] nums) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> removeDuplicates(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,1,2]",
        "expectedOutput": "[1,2]",
        "description": "Small sorted array with duplicates"
      },
      {
        "id": "pub_2",
        "input": "[0,0,1,1,1,2,2,3,3,4]",
        "expectedOutput": "[0,1,2,3,4]",
        "description": "Multiple repetitions"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[1]",
        "expectedOutput": "[1]"
      },
      {
        "id": "hid_2",
        "input": "[1,1,1,1]",
        "expectedOutput": "[1]"
      },
      {
        "id": "hid_3",
        "input": "[-3,-1,-1,0,0,2]",
        "expectedOutput": "[-3,-1,0,2]"
      },
      {
        "id": "hid_4",
        "input": "[1,2,3,4,5]",
        "expectedOutput": "[1,2,3,4,5]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_010",
    "title": "First Unique Character in a String",
    "difficulty": "Easy",
    "topic": "HashMap",
    "functionName": {
      "python": "first_uniq_char",
      "javascript": "firstUniqChar",
      "java": "firstUniqChar",
      "cpp": "firstUniqChar"
    },
    "description": "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
    "inputFormat": "Single line: string s",
    "outputFormat": "Integer 0-based index or -1",
    "examples": [
      {
        "input": "s = \"leetcode\"",
        "output": "0",
        "explanation": "Character \"l\" at index 0 does not repeat."
      },
      {
        "input": "s = \"loveleetcode\"",
        "output": "2",
        "explanation": "Character \"v\" at index 2 is the first unique character."
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^5",
      "s consists of only lowercase English letters."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def first_uniq_char(s):\n    # Write your solution here\n    pass",
      "javascript": "function firstUniqChar(s) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int firstUniqChar(String s) {\n        // Write your solution here\n        return -1;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int firstUniqChar(string s) {\n        // Write your solution here\n        return -1;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"leetcode\"",
        "expectedOutput": "0",
        "description": "Unique at start"
      },
      {
        "id": "pub_2",
        "input": "\"loveleetcode\"",
        "expectedOutput": "2",
        "description": "Unique in middle"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"aabb\"",
        "expectedOutput": "-1"
      },
      {
        "id": "hid_2",
        "input": "\"z\"",
        "expectedOutput": "0"
      },
      {
        "id": "hid_3",
        "input": "\"aadada\"",
        "expectedOutput": "-1"
      },
      {
        "id": "hid_4",
        "input": "\"dddccdbba\"",
        "expectedOutput": "8"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_011",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "topic": "Sliding Window",
    "functionName": {
      "python": "length_of_longest_substring",
      "javascript": "lengthOfLongestSubstring",
      "java": "lengthOfLongestSubstring",
      "cpp": "lengthOfLongestSubstring"
    },
    "description": "Given a string s, find the length of the longest substring without repeating characters.",
    "inputFormat": "Single line: string s",
    "outputFormat": "Integer length of longest substring",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", with the length of 3."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1",
        "explanation": "The answer is \"b\", with the length of 1."
      }
    ],
    "constraints": [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(min(n, m))",
    "starterCode": {
      "python": "def length_of_longest_substring(s):\n    # Write your solution here\n    pass",
      "javascript": "function lengthOfLongestSubstring(s) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"abcabcbb\"",
        "expectedOutput": "3",
        "description": "Repeating patterns"
      },
      {
        "id": "pub_2",
        "input": "\"bbbbb\"",
        "expectedOutput": "1",
        "description": "All identical chars"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"pwwkew\"",
        "expectedOutput": "3"
      },
      {
        "id": "hid_2",
        "input": "\"\"",
        "expectedOutput": "0"
      },
      {
        "id": "hid_3",
        "input": "\" \"",
        "expectedOutput": "1"
      },
      {
        "id": "hid_4",
        "input": "\"dvdf\"",
        "expectedOutput": "3"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_012",
    "title": "Container With Most Water",
    "difficulty": "Medium",
    "topic": "Two Pointers",
    "functionName": {
      "python": "max_area",
      "javascript": "maxArea",
      "java": "maxArea",
      "cpp": "maxArea"
    },
    "description": "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    "inputFormat": "Single line: JSON array of non-negative integers height",
    "outputFormat": "Integer maximum area",
    "examples": [
      {
        "input": "height = [1,8,6,2,5,4,8,3,7]",
        "output": "49",
        "explanation": "The max area is between index 1 and 8: min(8, 7) * (8 - 1) = 49."
      },
      {
        "input": "height = [1,1]",
        "output": "1",
        "explanation": "Between index 0 and 1: 1 * 1 = 1."
      }
    ],
    "constraints": [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def max_area(height):\n    # Write your solution here\n    pass",
      "javascript": "function maxArea(height) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,8,6,2,5,4,8,3,7]",
        "expectedOutput": "49",
        "description": "Standard container"
      },
      {
        "id": "pub_2",
        "input": "[1,1]",
        "expectedOutput": "1",
        "description": "Two identical boundaries"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[4,3,2,1,4]",
        "expectedOutput": "16"
      },
      {
        "id": "hid_2",
        "input": "[1,2,1]",
        "expectedOutput": "2"
      },
      {
        "id": "hid_3",
        "input": "[2,3,4,5,18,17,6]",
        "expectedOutput": "17"
      },
      {
        "id": "hid_4",
        "input": "[1,2,4,3]",
        "expectedOutput": "4"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_013",
    "title": "Binary Search on Rotated Sorted Array",
    "difficulty": "Medium",
    "topic": "Binary Search",
    "functionName": {
      "python": "search",
      "javascript": "search",
      "java": "search",
      "cpp": "search"
    },
    "description": "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length).\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    "inputFormat": "First line: JSON array nums\nSecond line: integer target",
    "outputFormat": "Integer 0-based index or -1",
    "examples": [
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 0",
        "output": "4",
        "explanation": "Target 0 is at index 4."
      },
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 3",
        "output": "-1",
        "explanation": "Target 3 does not exist in array."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5000",
      "-10^4 <= nums[i] <= 10^4",
      "All values of nums are unique.",
      "-10^4 <= target <= 10^4"
    ],
    "timeComplexity": "O(log n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def search(nums, target):\n    # Write your solution here\n    pass",
      "javascript": "function search(nums, target) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[4,5,6,7,0,1,2]\n0",
        "expectedOutput": "4",
        "description": "Target in right segment"
      },
      {
        "id": "pub_2",
        "input": "[4,5,6,7,0,1,2]\n3",
        "expectedOutput": "-1",
        "description": "Target not found"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[1]\n0",
        "expectedOutput": "-1"
      },
      {
        "id": "hid_2",
        "input": "[1]\n1",
        "expectedOutput": "0"
      },
      {
        "id": "hid_3",
        "input": "[5,1,3]\n5",
        "expectedOutput": "0"
      },
      {
        "id": "hid_4",
        "input": "[6,7,1,2,3,4,5]\n6",
        "expectedOutput": "0"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_014",
    "title": "Group Anagrams",
    "difficulty": "Medium",
    "topic": "HashMap",
    "functionName": {
      "python": "group_anagrams",
      "javascript": "groupAnagrams",
      "java": "groupAnagrams",
      "cpp": "groupAnagrams"
    },
    "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order, with each inner group and the outer array sorted alphabetically for deterministic evaluation.",
    "inputFormat": "Single line: JSON array of strings strs",
    "outputFormat": "JSON 2D array of grouped strings",
    "examples": [
      {
        "input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
        "explanation": "Strings with identical character counts are grouped."
      },
      {
        "input": "strs = [\"\"]",
        "output": "[[\"\"]]",
        "explanation": "Single empty string."
      }
    ],
    "constraints": [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters."
    ],
    "timeComplexity": "O(N * K log K)",
    "spaceComplexity": "O(N * K)",
    "starterCode": {
      "python": "def group_anagrams(strs):\n    # Write your solution here\n    pass",
      "javascript": "function groupAnagrams(strs) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "expectedOutput": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
        "description": "Multiple anagram groups"
      },
      {
        "id": "pub_2",
        "input": "[\"\"]",
        "expectedOutput": "[[\"\"]]",
        "description": "Single empty string"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[\"a\"]",
        "expectedOutput": "[[\"a\"]]"
      },
      {
        "id": "hid_2",
        "input": "[\"a\",\"b\",\"a\"]",
        "expectedOutput": "[[\"b\"],[\"a\",\"a\"]]"
      },
      {
        "id": "hid_3",
        "input": "[\"cat\",\"dog\",\"act\",\"god\"]",
        "expectedOutput": "[[\"act\",\"cat\"],[\"dog\",\"god\"]]"
      },
      {
        "id": "hid_4",
        "input": "[\"stop\",\"pots\",\"spot\",\"tops\"]",
        "expectedOutput": "[[\"pots\",\"spot\",\"stop\",\"tops\"]]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_015",
    "title": "Validate Binary Search Tree",
    "difficulty": "Medium",
    "topic": "Trees",
    "functionName": {
      "python": "is_valid_bst",
      "javascript": "isValidBST",
      "java": "isValidBST",
      "cpp": "isValidBST"
    },
    "description": "Given an array representing a binary tree in level order (where null indicates an absent node), determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys strictly less than the node's key.\n- The right subtree of a node contains only nodes with keys strictly greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    "inputFormat": "Single line: JSON array representing level-order traversal of the tree",
    "outputFormat": "Boolean true or false",
    "examples": [
      {
        "input": "tree = [2,1,3]",
        "output": "true",
        "explanation": "Root is 2, left is 1, right is 3. Valid BST."
      },
      {
        "input": "tree = [5,1,4,null,null,3,6]",
        "output": "false",
        "explanation": "Root is 5, but its right child is 4 which is less than 5."
      }
    ],
    "constraints": [
      "The number of nodes in the tree is in the range [1, 10^4].",
      "-2^31 <= Node.val <= 2^31 - 1"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "starterCode": {
      "python": "def is_valid_bst(tree):\n    # Write your solution here\n    pass",
      "javascript": "function isValidBST(tree) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public boolean isValidBST(Integer[] tree) {\n        // Write your solution here\n        return false;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    bool isValidBST(vector<string>& tree) {\n        // Write your solution here\n        return false;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[2,1,3]",
        "expectedOutput": "true",
        "description": "Valid simple BST"
      },
      {
        "id": "pub_2",
        "input": "[5,1,4,null,null,3,6]",
        "expectedOutput": "false",
        "description": "Invalid right subtree root"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[1,1]",
        "expectedOutput": "false"
      },
      {
        "id": "hid_2",
        "input": "[10,5,15,null,null,6,20]",
        "expectedOutput": "false"
      },
      {
        "id": "hid_3",
        "input": "[2147483647]",
        "expectedOutput": "true"
      },
      {
        "id": "hid_4",
        "input": "[5,4,6,null,null,3,7]",
        "expectedOutput": "false"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_016",
    "title": "LRU Cache",
    "difficulty": "Medium",
    "topic": "Design",
    "functionName": {
      "python": "run_lru_cache",
      "javascript": "runLRUCache",
      "java": "runLRUCache",
      "cpp": "runLRUCache"
    },
    "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the function run_lru_cache(capacity, operations) where operations is an array of commands: [\"put\", key, value] or [\"get\", key]. Return an array of the outputs produced by each operation (put produces null, get produces the integer value or -1 if not found).",
    "inputFormat": "First line: integer capacity\nSecond line: JSON array of operations",
    "outputFormat": "JSON array of return values",
    "examples": [
      {
        "input": "capacity = 2\noperations = [[\"put\",1,1],[\"put\",2,2],[\"get\",1],[\"put\",3,3],[\"get\",2]]",
        "output": "[null,null,1,null,-1]",
        "explanation": "Key 2 was evicted when key 3 was inserted."
      },
      {
        "input": "capacity = 1\noperations = [[\"put\",2,1],[\"get\",2],[\"put\",3,2],[\"get\",2],[\"get\",3]]",
        "output": "[null,1,null,-1,2]",
        "explanation": "Capacity 1 evicts key 2 when 3 is added."
      }
    ],
    "constraints": [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls to get and put."
    ],
    "timeComplexity": "O(1) average per get and put",
    "spaceComplexity": "O(capacity)",
    "starterCode": {
      "python": "def run_lru_cache(capacity, operations):\n    # Write your solution here\n    pass",
      "javascript": "function runLRUCache(capacity, operations) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public List<Object> runLRUCache(int capacity, List<List<Object>> operations) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> runLRUCache(int capacity, vector<vector<string>>& operations) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "2\n[[\"put\",1,1],[\"put\",2,2],[\"get\",1],[\"put\",3,3],[\"get\",2]]",
        "expectedOutput": "[null,null,1,null,-1]",
        "description": "Basic eviction"
      },
      {
        "id": "pub_2",
        "input": "1\n[[\"put\",2,1],[\"get\",2],[\"put\",3,2],[\"get\",2],[\"get\",3]]",
        "expectedOutput": "[null,1,null,-1,2]",
        "description": "Capacity 1 eviction"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "2\n[[\"get\",2],[\"put\",2,6],[\"get\",1],[\"put\",1,5],[\"put\",1,2],[\"get\",1],[\"get\",2]]",
        "expectedOutput": "[-1,null,-1,null,null,2,6]"
      },
      {
        "id": "hid_2",
        "input": "2\n[[\"put\",2,1],[\"put\",1,1],[\"put\",2,3],[\"put\",4,1],[\"get\",1],[\"get\",2]]",
        "expectedOutput": "[null,null,null,null,-1,3]"
      },
      {
        "id": "hid_3",
        "input": "3\n[[\"put\",1,1],[\"put\",2,2],[\"put\",3,3],[\"get\",1],[\"put\",4,4],[\"get\",2]]",
        "expectedOutput": "[null,null,null,1,null,-1]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_017",
    "title": "Product of Array Except Self",
    "difficulty": "Medium",
    "topic": "Prefix Sum",
    "functionName": {
      "python": "product_except_self",
      "javascript": "productExceptSelf",
      "java": "productExceptSelf",
      "cpp": "productExceptSelf"
    },
    "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nYou must write an algorithm that runs in O(n) time and without using the division operator.",
    "inputFormat": "Single line: JSON array of integers nums",
    "outputFormat": "JSON array of integers answer",
    "examples": [
      {
        "input": "nums = [1,2,3,4]",
        "output": "[24,12,8,6]",
        "explanation": "Product of all except 1 is 24, except 2 is 12, etc."
      },
      {
        "input": "nums = [-1,1,0,-3,3]",
        "output": "[0,0,9,0,0]",
        "explanation": "Zero element yields product only at zero index."
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "The product of any prefix or suffix of nums fits in a 32-bit integer."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1) extra space excluding output array",
    "starterCode": {
      "python": "def product_except_self(nums):\n    # Write your solution here\n    pass",
      "javascript": "function productExceptSelf(nums) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,2,3,4]",
        "expectedOutput": "[24,12,8,6]",
        "description": "All positive numbers"
      },
      {
        "id": "pub_2",
        "input": "[-1,1,0,-3,3]",
        "expectedOutput": "[0,0,9,0,0]",
        "description": "Single zero element"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[2,3]",
        "expectedOutput": "[3,2]"
      },
      {
        "id": "hid_2",
        "input": "[0,0]",
        "expectedOutput": "[0,0]"
      },
      {
        "id": "hid_3",
        "input": "[1,-1]",
        "expectedOutput": "[-1,1]"
      },
      {
        "id": "hid_4",
        "input": "[4,5,1,8,2]",
        "expectedOutput": "[80,64,320,40,160]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_018",
    "title": "Spiral Matrix",
    "difficulty": "Medium",
    "topic": "2D Arrays",
    "functionName": {
      "python": "spiral_order",
      "javascript": "spiralOrder",
      "java": "spiralOrder",
      "cpp": "spiralOrder"
    },
    "description": "Given an m x n matrix, return all elements of the matrix in spiral order.",
    "inputFormat": "Single line: JSON 2D array of integers matrix",
    "outputFormat": "JSON array of integers in spiral order",
    "examples": [
      {
        "input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        "output": "[1,2,3,6,9,8,7,4,5]",
        "explanation": "Traverse right, down, left, up, center."
      },
      {
        "input": "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
        "output": "[1,2,3,4,8,12,11,10,9,5,6,7]",
        "explanation": "Spiral traversal of 3x4 matrix."
      }
    ],
    "constraints": [
      "m == matrix.length",
      "n == matrix[i].length",
      "1 <= m, n <= 10",
      "-100 <= matrix[i][j] <= 100"
    ],
    "timeComplexity": "O(m * n)",
    "spaceComplexity": "O(1) extra space",
    "starterCode": {
      "python": "def spiral_order(matrix):\n    # Write your solution here\n    pass",
      "javascript": "function spiralOrder(matrix) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> spiralOrder(vector<vector<int>>& matrix) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[[1,2,3],[4,5,6],[7,8,9]]",
        "expectedOutput": "[1,2,3,6,9,8,7,4,5]",
        "description": "3x3 square matrix"
      },
      {
        "id": "pub_2",
        "input": "[[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
        "expectedOutput": "[1,2,3,4,8,12,11,10,9,5,6,7]",
        "description": "3x4 rectangular matrix"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[[1]]",
        "expectedOutput": "[1]"
      },
      {
        "id": "hid_2",
        "input": "[[1,2],[3,4]]",
        "expectedOutput": "[1,2,4,3]"
      },
      {
        "id": "hid_3",
        "input": "[[7],[9],[6]]",
        "expectedOutput": "[7,9,6]"
      },
      {
        "id": "hid_4",
        "input": "[[1,2,3,4,5]]",
        "expectedOutput": "[1,2,3,4,5]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_019",
    "title": "Maximum Product Subarray",
    "difficulty": "Medium",
    "topic": "DP",
    "functionName": {
      "python": "max_product",
      "javascript": "maxProduct",
      "java": "maxProduct",
      "cpp": "maxProduct"
    },
    "description": "Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product.",
    "inputFormat": "Single line: JSON array of integers nums",
    "outputFormat": "Integer representing maximum subarray product",
    "examples": [
      {
        "input": "nums = [2,3,-2,4]",
        "output": "6",
        "explanation": "[2,3] has the largest product 6."
      },
      {
        "input": "nums = [-2,0,-1]",
        "output": "0",
        "explanation": "The result cannot be 2, because [-2,-1] is not a contiguous subarray."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2 * 10^4",
      "-10 <= nums[i] <= 10",
      "The product of any prefix or suffix fits in a 32-bit integer."
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def max_product(nums):\n    # Write your solution here\n    pass",
      "javascript": "function maxProduct(nums) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int maxProduct(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[2,3,-2,4]",
        "expectedOutput": "6",
        "description": "Product with negative interruption"
      },
      {
        "id": "pub_2",
        "input": "[-2,0,-1]",
        "expectedOutput": "0",
        "description": "Zero element interruption"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[-2]",
        "expectedOutput": "-2"
      },
      {
        "id": "hid_2",
        "input": "[-2,3,-4]",
        "expectedOutput": "24"
      },
      {
        "id": "hid_3",
        "input": "[0,2]",
        "expectedOutput": "2"
      },
      {
        "id": "hid_4",
        "input": "[-4,-3,-2]",
        "expectedOutput": "12"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_020",
    "title": "Find Peak Element",
    "difficulty": "Medium",
    "topic": "Binary Search",
    "functionName": {
      "python": "find_peak_element",
      "javascript": "findPeakElement",
      "java": "findPeakElement",
      "cpp": "findPeakElement"
    },
    "description": "A peak element is an element that is strictly greater than its neighbors.\n\nGiven a 0-indexed integer array nums, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.\n\nYou may imagine that nums[-1] = nums[n] = -inf. You must write an algorithm that runs in O(log n) time.",
    "inputFormat": "Single line: JSON array of integers nums",
    "outputFormat": "Integer 0-based index of a peak element",
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "2",
        "explanation": "3 is a peak element and your function should return the index number 2."
      },
      {
        "input": "nums = [1,2,1,3,5,6,4]",
        "output": "5",
        "explanation": "Your function can return either index 1 (value 2) or index 5 (value 6)."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 1000",
      "-2^31 <= nums[i] <= 2^31 - 1",
      "nums[i] != nums[i + 1] for all valid i."
    ],
    "timeComplexity": "O(log n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def find_peak_element(nums):\n    # Write your solution here\n    pass",
      "javascript": "function findPeakElement(nums) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int findPeakElement(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int findPeakElement(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,2,3,1]",
        "expectedOutput": "2",
        "description": "Single central peak"
      },
      {
        "id": "pub_2",
        "input": "[1,2,1,3,5,6,4]",
        "expectedOutput": "5",
        "description": "Multiple peaks"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[1]",
        "expectedOutput": "0"
      },
      {
        "id": "hid_2",
        "input": "[1,2]",
        "expectedOutput": "1"
      },
      {
        "id": "hid_3",
        "input": "[2,1]",
        "expectedOutput": "0"
      },
      {
        "id": "hid_4",
        "input": "[1,3,2,1]",
        "expectedOutput": "1"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_021",
    "title": "Median of Two Sorted Arrays",
    "difficulty": "Hard",
    "topic": "Binary Search",
    "functionName": {
      "python": "find_median_sorted_arrays",
      "javascript": "findMedianSortedArrays",
      "java": "findMedianSortedArrays",
      "cpp": "findMedianSortedArrays"
    },
    "description": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    "inputFormat": "First line: JSON array nums1\nSecond line: JSON array nums2",
    "outputFormat": "Float number formatted to 1 decimal place (e.g. 2.0 or 2.5)",
    "examples": [
      {
        "input": "nums1 = [1,3], nums2 = [2]",
        "output": "2.0",
        "explanation": "merged array = [1,2,3] and median is 2.0."
      },
      {
        "input": "nums1 = [1,2], nums2 = [3,4]",
        "output": "2.5",
        "explanation": "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    "constraints": [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m, n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6"
    ],
    "timeComplexity": "O(log(min(m, n)))",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def find_median_sorted_arrays(nums1, nums2):\n    # Write your solution here\n    pass",
      "javascript": "function findMedianSortedArrays(nums1, nums2) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return 0.0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your solution here\n        return 0.0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,3]\n[2]",
        "expectedOutput": "2.0",
        "description": "Odd combined length"
      },
      {
        "id": "pub_2",
        "input": "[1,2]\n[3,4]",
        "expectedOutput": "2.5",
        "description": "Even combined length"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[0,0]\n[0,0]",
        "expectedOutput": "0.0"
      },
      {
        "id": "hid_2",
        "input": "[]\n[1]",
        "expectedOutput": "1.0"
      },
      {
        "id": "hid_3",
        "input": "[2]\n[]",
        "expectedOutput": "2.0"
      },
      {
        "id": "hid_4",
        "input": "[1,3,8,9,15]\n[7,11,18,19,21,25]",
        "expectedOutput": "11.0"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_022",
    "title": "Trapping Rain Water",
    "difficulty": "Hard",
    "topic": "Stack/Two Pointers",
    "functionName": {
      "python": "trap",
      "javascript": "trap",
      "java": "trap",
      "cpp": "trap"
    },
    "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    "inputFormat": "Single line: JSON array of non-negative integers height",
    "outputFormat": "Integer total trapped water units",
    "examples": [
      {
        "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        "output": "6",
        "explanation": "The elevation map traps 6 units of water."
      },
      {
        "input": "height = [4,2,0,3,2,5]",
        "output": "9",
        "explanation": "The elevation map traps 9 units of water."
      }
    ],
    "constraints": [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "starterCode": {
      "python": "def trap(height):\n    # Write your solution here\n    pass",
      "javascript": "function trap(height) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[0,1,0,2,1,0,1,3,2,1,2,1]",
        "expectedOutput": "6",
        "description": "Complex topography"
      },
      {
        "id": "pub_2",
        "input": "[4,2,0,3,2,5]",
        "expectedOutput": "9",
        "description": "Deep central ravine"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[3,0,2,0,4]",
        "expectedOutput": "7"
      },
      {
        "id": "hid_2",
        "input": "[2,0,2]",
        "expectedOutput": "2"
      },
      {
        "id": "hid_3",
        "input": "[5,4,1,2]",
        "expectedOutput": "1"
      },
      {
        "id": "hid_4",
        "input": "[0,0,0]",
        "expectedOutput": "0"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_023",
    "title": "N-Queens",
    "difficulty": "Hard",
    "topic": "Backtracking",
    "functionName": {
      "python": "total_n_queens",
      "javascript": "totalNQueens",
      "java": "totalNQueens",
      "cpp": "totalNQueens"
    },
    "description": "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return the number of distinct solutions to the n-queens puzzle.",
    "inputFormat": "Single line: integer n",
    "outputFormat": "Integer number of distinct valid queen placements",
    "examples": [
      {
        "input": "n = 4",
        "output": "2",
        "explanation": "There are two distinct solutions to the 4-queens puzzle."
      },
      {
        "input": "n = 1",
        "output": "1",
        "explanation": "A single queen on 1x1 board has 1 solution."
      }
    ],
    "constraints": [
      "1 <= n <= 9"
    ],
    "timeComplexity": "O(n!)",
    "spaceComplexity": "O(n)",
    "starterCode": {
      "python": "def total_n_queens(n):\n    # Write your solution here\n    pass",
      "javascript": "function totalNQueens(n) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int totalNQueens(int n) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int totalNQueens(int n) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "4",
        "expectedOutput": "2",
        "description": "4x4 board"
      },
      {
        "id": "pub_2",
        "input": "1",
        "expectedOutput": "1",
        "description": "1x1 board"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "2",
        "expectedOutput": "0"
      },
      {
        "id": "hid_2",
        "input": "3",
        "expectedOutput": "0"
      },
      {
        "id": "hid_3",
        "input": "5",
        "expectedOutput": "10"
      },
      {
        "id": "hid_4",
        "input": "8",
        "expectedOutput": "92"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_024",
    "title": "Word Break II",
    "difficulty": "Hard",
    "topic": "DP/Backtracking",
    "functionName": {
      "python": "word_break",
      "javascript": "wordBreak",
      "java": "wordBreak",
      "cpp": "wordBreak"
    },
    "description": "Given a string s and a dictionary of strings wordDict, add spaces in s to construct a sentence where each word is a valid dictionary word. Return all such possible sentences in sorted order.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.",
    "inputFormat": "First line: string s\nSecond line: JSON array of strings wordDict",
    "outputFormat": "JSON array of valid sentences sorted alphabetically",
    "examples": [
      {
        "input": "s = \"catsanddog\"\nwordDict = [\"cat\",\"cats\",\"and\",\"sand\",\"dog\"]",
        "output": "[\"cat sand dog\",\"cats and dog\"]",
        "explanation": "Two valid sentence segmentations exist."
      },
      {
        "input": "s = \"pineapplepenapple\"\nwordDict = [\"apple\",\"pen\",\"applepen\",\"pine\",\"pineapple\"]",
        "output": "[\"pine apple pen apple\",\"pine applepen apple\",\"pineapple pen apple\"]",
        "explanation": "Three valid segmentations."
      }
    ],
    "constraints": [
      "1 <= s.length <= 20",
      "1 <= wordDict.length <= 1000",
      "1 <= wordDict[i].length <= 10",
      "All strings consist of lowercase English letters."
    ],
    "timeComplexity": "O(2^n)",
    "spaceComplexity": "O(2^n)",
    "starterCode": {
      "python": "def word_break(s, word_dict):\n    # Write your solution here\n    pass",
      "javascript": "function wordBreak(s, wordDict) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public List<String> wordBreak(String s, List<String> wordDict) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<string> wordBreak(string s, vector<string>& wordDict) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"catsanddog\"\n[\"cat\",\"cats\",\"and\",\"sand\",\"dog\"]",
        "expectedOutput": "[\"cat sand dog\",\"cats and dog\"]",
        "description": "Multiple segmentations"
      },
      {
        "id": "pub_2",
        "input": "\"pineapplepenapple\"\n[\"apple\",\"pen\",\"applepen\",\"pine\",\"pineapple\"]",
        "expectedOutput": "[\"pine apple pen apple\",\"pine applepen apple\",\"pineapple pen apple\"]",
        "description": "Reusing words"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"catsandog\"\n[\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]",
        "expectedOutput": "[]"
      },
      {
        "id": "hid_2",
        "input": "\"a\"\n[\"a\"]",
        "expectedOutput": "[\"a\"]"
      },
      {
        "id": "hid_3",
        "input": "\"bb\"\n[\"b\"]",
        "expectedOutput": "[\"b b\"]"
      },
      {
        "id": "hid_4",
        "input": "\"ab\"\n[\"a\",\"b\"]",
        "expectedOutput": "[\"a b\"]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_025",
    "title": "Alien Dictionary",
    "difficulty": "Hard",
    "topic": "Topological Sort",
    "functionName": {
      "python": "alien_order",
      "javascript": "alienOrder",
      "java": "alienOrder",
      "cpp": "alienOrder"
    },
    "description": "There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.\n\nYou are given a list of strings words from the alien language's dictionary, where the strings are claimed to be sorted lexicographically by the rules of this new language.\n\nReturn a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules. If no valid ordering exists, return \"\". If multiple valid orderings exist, return any of them.",
    "inputFormat": "Single line: JSON array of strings words",
    "outputFormat": "String containing characters in order or empty string if invalid",
    "examples": [
      {
        "input": "words = [\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]",
        "output": "\"wertf\"",
        "explanation": "From the words: \"wrt\" < \"wrf\" implies 't' < 'f', etc. Valid order is \"wertf\"."
      },
      {
        "input": "words = [\"z\",\"x\"]",
        "output": "\"zx\"",
        "explanation": "'z' comes before 'x'."
      }
    ],
    "constraints": [
      "1 <= words.length <= 100",
      "1 <= words[i].length <= 100",
      "words[i] consists of only lowercase English letters."
    ],
    "timeComplexity": "O(C) where C is the total length of all words",
    "spaceComplexity": "O(1) (at most 26 lowercase English letters)",
    "starterCode": {
      "python": "def alien_order(words):\n    # Write your solution here\n    pass",
      "javascript": "function alienOrder(words) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public String alienOrder(String[] words) {\n        // Write your solution here\n        return \"\";\n    }\n}",
      "cpp": "class Solution {\npublic:\n    string alienOrder(vector<string>& words) {\n        // Write your solution here\n        return \"\";\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]",
        "expectedOutput": "\"wertf\"",
        "description": "Valid 5-letter alphabet"
      },
      {
        "id": "pub_2",
        "input": "[\"z\",\"x\"]",
        "expectedOutput": "\"zx\"",
        "description": "Simple two letters"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[\"z\",\"x\",\"z\"]",
        "expectedOutput": "\"\""
      },
      {
        "id": "hid_2",
        "input": "[\"abc\",\"ab\"]",
        "expectedOutput": "\"\""
      },
      {
        "id": "hid_3",
        "input": "[\"z\"]",
        "expectedOutput": "\"z\""
      },
      {
        "id": "hid_4",
        "input": "[\"ab\",\"adc\"]",
        "expectedOutput": "\"abcd\""
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_026",
    "title": "Sliding Window Maximum",
    "difficulty": "Hard",
    "topic": "Deque",
    "functionName": {
      "python": "max_sliding_window",
      "javascript": "maxSlidingWindow",
      "java": "maxSlidingWindow",
      "cpp": "maxSlidingWindow"
    },
    "description": "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window array.",
    "inputFormat": "First line: JSON array nums\nSecond line: integer k",
    "outputFormat": "JSON array of integers",
    "examples": [
      {
        "input": "nums = [1,3,-1,-3,5,3,6,7]\nk = 3",
        "output": "[3,3,5,5,6,7]",
        "explanation": "Window max values are 3, 3, 5, 5, 6, 7 as window moves."
      },
      {
        "input": "nums = [1]\nk = 1",
        "output": "[1]",
        "explanation": "Single element window."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "1 <= k <= nums.length"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(k)",
    "starterCode": {
      "python": "def max_sliding_window(nums, k):\n    # Write your solution here\n    pass",
      "javascript": "function maxSlidingWindow(nums, k) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,3,-1,-3,5,3,6,7]\n3",
        "expectedOutput": "[3,3,5,5,6,7]",
        "description": "Standard window k=3"
      },
      {
        "id": "pub_2",
        "input": "[1]\n1",
        "expectedOutput": "[1]",
        "description": "Single element"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[1,-1]\n1",
        "expectedOutput": "[1,-1]"
      },
      {
        "id": "hid_2",
        "input": "[9,11]\n2",
        "expectedOutput": "[11]"
      },
      {
        "id": "hid_3",
        "input": "[4,-2]\n2",
        "expectedOutput": "[4]"
      },
      {
        "id": "hid_4",
        "input": "[7,2,4]\n2",
        "expectedOutput": "[7,4]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_027",
    "title": "Minimum Window Substring",
    "difficulty": "Hard",
    "topic": "Sliding Window",
    "functionName": {
      "python": "min_window",
      "javascript": "minWindow",
      "java": "minWindow",
      "cpp": "minWindow"
    },
    "description": "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".\n\nThe testcases will be generated such that the answer is unique.",
    "inputFormat": "First line: string s\nSecond line: string t",
    "outputFormat": "String minimum window or empty string \"\"",
    "examples": [
      {
        "input": "s = \"ADOBECODEBANC\"\nt = \"ABC\"",
        "output": "\"BANC\"",
        "explanation": "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t."
      },
      {
        "input": "s = \"a\"\nt = \"a\"",
        "output": "\"a\"",
        "explanation": "Entire string s is the minimum window."
      }
    ],
    "constraints": [
      "m == s.length",
      "n == t.length",
      "1 <= m, n <= 10^5",
      "s and t consist of uppercase and lowercase English letters."
    ],
    "timeComplexity": "O(m + n)",
    "spaceComplexity": "O(m + n)",
    "starterCode": {
      "python": "def min_window(s, t):\n    # Write your solution here\n    pass",
      "javascript": "function minWindow(s, t) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public String minWindow(String s, String t) {\n        // Write your solution here\n        return \"\";\n    }\n}",
      "cpp": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        // Write your solution here\n        return \"\";\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"ADOBECODEBANC\"\n\"ABC\"",
        "expectedOutput": "\"BANC\"",
        "description": "Standard window"
      },
      {
        "id": "pub_2",
        "input": "\"a\"\n\"a\"",
        "expectedOutput": "\"a\"",
        "description": "Identical 1-char strings"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"a\"\n\"aa\"",
        "expectedOutput": "\"\""
      },
      {
        "id": "hid_2",
        "input": "\"ab\"\n\"b\"",
        "expectedOutput": "\"b\""
      },
      {
        "id": "hid_3",
        "input": "\"bba\"\n\"ab\"",
        "expectedOutput": "\"ba\""
      },
      {
        "id": "hid_4",
        "input": "\"bdab\"\n\"ab\"",
        "expectedOutput": "\"ab\""
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_028",
    "title": "Regular Expression Matching",
    "difficulty": "Hard",
    "topic": "DP",
    "functionName": {
      "python": "is_match",
      "javascript": "isMatch",
      "java": "isMatch",
      "cpp": "isMatch"
    },
    "description": "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n- '.' Matches any single character.\n- '*' Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
    "inputFormat": "First line: string s\nSecond line: string p",
    "outputFormat": "Boolean true or false",
    "examples": [
      {
        "input": "s = \"aa\"\np = \"a\"",
        "output": "false",
        "explanation": "\"a\" does not match the entire string \"aa\"."
      },
      {
        "input": "s = \"aa\"\np = \"a*\"",
        "output": "true",
        "explanation": "'*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes \"aa\"."
      },
      {
        "input": "s = \"ab\"\np = \".*\"",
        "output": "true",
        "explanation": "\".*\" means \"zero or more (*) of any character (.)\"."
      }
    ],
    "constraints": [
      "1 <= s.length <= 20",
      "1 <= p.length <= 20",
      "s contains only lowercase English letters.",
      "p contains only lowercase English letters, '.', and '*'.",
      "It is guaranteed for each appearance of the character '*', there will be a previous valid character to match."
    ],
    "timeComplexity": "O(m * n)",
    "spaceComplexity": "O(m * n)",
    "starterCode": {
      "python": "def is_match(s, p):\n    # Write your solution here\n    pass",
      "javascript": "function isMatch(s, p) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your solution here\n        return false;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    bool isMatch(string s, string p) {\n        // Write your solution here\n        return false;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "\"aa\"\n\"a\"",
        "expectedOutput": "false",
        "description": "Single character pattern"
      },
      {
        "id": "pub_2",
        "input": "\"aa\"\n\"a*\"",
        "expectedOutput": "true",
        "description": "Star wildcard repetition"
      },
      {
        "id": "pub_3",
        "input": "\"ab\"\n\".*\"",
        "expectedOutput": "true",
        "description": "Dot star match-all"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "\"aab\"\n\"c*a*b\"",
        "expectedOutput": "true"
      },
      {
        "id": "hid_2",
        "input": "\"mississippi\"\n\"mis*is*p*.\"",
        "expectedOutput": "false"
      },
      {
        "id": "hid_3",
        "input": "\"\"\n\".*\"",
        "expectedOutput": "true"
      },
      {
        "id": "hid_4",
        "input": "\"ab\"\n\".*c\"",
        "expectedOutput": "false"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_029",
    "title": "Serialize and Deserialize Binary Tree",
    "difficulty": "Hard",
    "topic": "Trees",
    "functionName": {
      "python": "serialize_and_deserialize",
      "javascript": "serializeAndDeserialize",
      "java": "serializeAndDeserialize",
      "cpp": "serializeAndDeserialize"
    },
    "description": "Serialization is the process of converting a data structure or object into a sequence of bits or a string so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree represented as a level-order array. Your function serializeAndDeserialize(treeArray) should serialize the tree to a string and deserialize it back into the original level-order array.",
    "inputFormat": "Single line: JSON array representing level-order binary tree",
    "outputFormat": "JSON array identical to the input tree",
    "examples": [
      {
        "input": "tree = [1,2,3,null,null,4,5]",
        "output": "[1,2,3,null,null,4,5]",
        "explanation": "Tree is preserved completely after serialize and deserialize roundtrip."
      },
      {
        "input": "tree = []",
        "output": "[]",
        "explanation": "Empty tree preserves empty array."
      }
    ],
    "constraints": [
      "The number of nodes in the tree is in the range [0, 10^4].",
      "-1000 <= Node.val <= 1000"
    ],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "starterCode": {
      "python": "def serialize_and_deserialize(tree_array):\n    # Write your solution here\n    pass",
      "javascript": "function serializeAndDeserialize(treeArray) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public List<Integer> serializeAndDeserialize(List<Integer> treeArray) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<string> serializeAndDeserialize(vector<string>& treeArray) {\n        // Write your solution here\n        return {};\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[1,2,3,null,null,4,5]",
        "expectedOutput": "[1,2,3,null,null,4,5]",
        "description": "Full binary tree"
      },
      {
        "id": "pub_2",
        "input": "[]",
        "expectedOutput": "[]",
        "description": "Empty tree"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[1]",
        "expectedOutput": "[1]"
      },
      {
        "id": "hid_2",
        "input": "[1,2]",
        "expectedOutput": "[1,2]"
      },
      {
        "id": "hid_3",
        "input": "[1,null,2,null,3]",
        "expectedOutput": "[1,null,2,null,3]"
      },
      {
        "id": "hid_4",
        "input": "[5,3,6,2,4,null,null,1]",
        "expectedOutput": "[5,3,6,2,4,null,null,1]"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  },
  {
    "id": "prob_030",
    "title": "Find Minimum Cost to Connect All Points",
    "difficulty": "Hard",
    "topic": "MST/Greedy",
    "functionName": {
      "python": "min_cost_connect_points",
      "javascript": "minCostConnectPoints",
      "java": "minCostConnectPoints",
      "cpp": "minCostConnectPoints"
    },
    "description": "You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi].\n\nThe cost of connecting two points [xi, yi] and [xj, yj] is the manhattan distance between them: |xi - xj| + |yi - yj|.\n\nReturn the minimum cost to make all points connected. All points are connected if there is exactly one simple path between any two points.",
    "inputFormat": "Single line: JSON 2D array of coordinates points",
    "outputFormat": "Integer minimum total Manhattan distance cost",
    "examples": [
      {
        "input": "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]",
        "output": "20",
        "explanation": "Connecting all points with minimum spanning tree gives total cost 20."
      },
      {
        "input": "points = [[3,12],[-2,5],[-4,1]]",
        "output": "18",
        "explanation": "Total cost to connect the 3 points is 18."
      }
    ],
    "constraints": [
      "1 <= points.length <= 1000",
      "-10^6 <= xi, yi <= 10^6",
      "All pairs (xi, yi) are distinct."
    ],
    "timeComplexity": "O(n^2 log n) or O(n^2)",
    "spaceComplexity": "O(n)",
    "starterCode": {
      "python": "def min_cost_connect_points(points):\n    # Write your solution here\n    pass",
      "javascript": "function minCostConnectPoints(points) {\n    // Write your solution here\n}",
      "java": "class Solution {\n    public int minCostConnectPoints(int[][] points) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int minCostConnectPoints(vector<vector<int>>& points) {\n        // Write your solution here\n        return 0;\n    }\n};"
    },
    "publicTestCases": [
      {
        "id": "pub_1",
        "input": "[[0,0],[2,2],[3,10],[5,2],[7,0]]",
        "expectedOutput": "20",
        "description": "5 scattered points"
      },
      {
        "id": "pub_2",
        "input": "[[3,12],[-2,5],[-4,1]]",
        "expectedOutput": "18",
        "description": "Triangle points"
      }
    ],
    "hiddenTestCases": [
      {
        "id": "hid_1",
        "input": "[[0,0]]",
        "expectedOutput": "0"
      },
      {
        "id": "hid_2",
        "input": "[[0,0],[1,1],[1,0],[-1,1]]",
        "expectedOutput": "4"
      },
      {
        "id": "hid_3",
        "input": "[[-1000000,-1000000],[1000000,1000000]]",
        "expectedOutput": "4000000"
      },
      {
        "id": "hid_4",
        "input": "[[0,0],[1,0],[2,0],[3,0]]",
        "expectedOutput": "3"
      }
    ],
    "supportedLanguages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ]
  }
];

module.exports = CODING_PROBLEMS;
