const GENERATE_QUESTIONS_PROMPT = (role, resumeText, totalQuestions) => `
You are an expert technical interviewer. Based on the candidate's resume and the target role, generate exactly ${totalQuestions - 1} interview questions. 
Do NOT include the "Tell me about yourself" question.

Role: ${role}
Resume:
${resumeText}

Requirements:
- 1 to 2 behavioral questions (based on the resume)
- 1 to 2 technical questions (specific to the role)
- Exactly 1 coding question (explicitly marked as a coding question)

Please format your response as a valid JSON array of objects, with each object having "question" (string) and "type" (string: "behavioral", "technical", or "coding"). Example format:
[
  {
    "question": "Describe a challenging issue you faced...",
    "type": "behavioral"
  }
]
`;

const FOLLOW_UP_PROMPT = (conversationHistory) => `
You are an expert technical interviewer conducting an interview. Based on the following conversation history with the candidate, generate a contextual follow-up question. 
The follow-up should reflect the candidate’s previous answers and probe their technical or behavioral responses further.

Conversation History:
${conversationHistory}

Generate exactly one follow-up question. Return only the question text.
`;

const buildConversationHistory = (messages) => {
    // Limit to the last 20 messages
    const maxMessages = 20;
    const recentMessages = messages.slice(-maxMessages);
    
    // Ensure token efficiency by formatting concisely
    return recentMessages
        .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
        .join('\n');
};

const INTERVIEW_GREETING_PROMPT = (userName, role) => `
You are an expert technical interviewer. Greet the candidate ${userName} who is interviewing for the ${role} position. Provide a natural and welcoming introductory greeting, and let the candidate know you will start the interview by asking them to introduce themselves. Return ONLY the greeting text.
`;

const FEEDBACK_PROMPT = (role, conversationHistory, codeSubmissions) => `
You are an expert technical interviewer evaluating a candidate for the ${role} position.
Based on the following conversation and code submissions, generate constructive feedback.

Provide the response strictly as a JSON object with the following structure:
{
  "scores": {
    "Communication Skills": <number out of 10>,
    "Technical Knowledge": <number out of 10>,
    "Problem Solving": <number out of 10>,
    "Code Quality": <number out of 10>,
    "Overall Performance": <number out of 10>
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
}

Conversation History:
${conversationHistory}

Code Submissions:
${codeSubmissions}
`;

const EVALUATE_CODE_PROMPT = (question, code) => `
Evaluate the following code submission for the question: "${question}".
Code:
${code}
`;

module.exports = {
    GENERATE_QUESTIONS_PROMPT,
    FOLLOW_UP_PROMPT,
    buildConversationHistory,
    INTERVIEW_GREETING_PROMPT,
    FEEDBACK_PROMPT,
    EVALUATE_CODE_PROMPT
};
