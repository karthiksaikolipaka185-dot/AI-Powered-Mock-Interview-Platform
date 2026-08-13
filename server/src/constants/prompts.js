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

 Provide the response STRICTLY as a valid JSON object. Do not include any introductory or concluding text. Use exactly this structure:
 {
   "scores": {
     "Communication Skills": <number 0-10>,
     "Technical Knowledge": <number 0-10>,
     "Problem Solving": <number 0-10>,
     "Code Quality": <number 0-10>,
     "Overall Performance": <number 0-10>
   },
   "strengths": ["string"],
   "weaknesses": ["string"],
   "suggestions": ["string"]
 }
 
 IMPORTANT: Values in "scores" must be numbers, not strings.
 
 Conversation History:
 ${conversationHistory}
 
 Code Submissions:
 ${codeSubmissions}
 `;

const GENERATE_BLUEPRINT_PROMPT = (role, resumeText, difficulty, totalQuestions) => `
You are an expert lead technical recruiter. Based on the target role "${role}", candidate resume, target difficulty "${difficulty}", and planned question count of ${totalQuestions}, generate a structured adaptive interview blueprint.

Resume Context:
${resumeText}

Generate a JSON object specifying topic breakdown categories, target weights, initial question plan, and target competencies.
Format response strictly as valid JSON:
{
  "role": "${role}",
  "initialDifficulty": "${difficulty}",
  "topics": [
    { "category": "Behavioral & Resume", "weightPercentage": 15, "plannedCount": 1 },
    { "category": "Core Architecture & Concepts", "weightPercentage": 35, "plannedCount": 2 },
    { "category": "Domain Deep Dive", "weightPercentage": 30, "plannedCount": 1 },
    { "category": "Coding Challenge", "weightPercentage": 20, "plannedCount": 1 }
  ],
  "focusAreas": ["string", "string"]
}
`;

const EVALUATE_ANSWER_PROMPT = (currentQuestion, userAnswer, role, currentDifficulty) => `
You are an expert technical interviewer evaluating a candidate's response for the role of ${role} at difficulty level ${currentDifficulty}.

Question Asked:
"${currentQuestion}"

Candidate's Answer:
"${userAnswer}"

Evaluate the response objectively. Return strictly valid JSON:
{
  "technicalScore": <number 0-10>,
  "communicationScore": <number 0-10>,
  "overallScore": <number 0-10>,
  "strengths": ["short string strength"],
  "weaknesses": ["short string weakness"],
  "conceptsMissed": ["concept"],
  "depthRating": "<Weak|Moderate|Strong|Exceptional>"
}
`;

const GENERATE_ADAPTIVE_QUESTION_PROMPT = (role, currentDifficulty, blueprintJson, trackerJson, lastEvalJson, conversationHistory, currentQuestionNum, totalQuestions) => `
You are an adaptive AI interviewer evaluating a candidate for the role of "${role}".
Current Interview State:
- Adaptive Difficulty: ${currentDifficulty}
- Question Number: ${currentQuestionNum} of ${totalQuestions}
- Interview Blueprint: ${JSON.stringify(blueprintJson)}
- Accumulated Performance: ${JSON.stringify(trackerJson)}
- Last Answer Evaluation: ${JSON.stringify(lastEvalJson)}

Recent Conversation History:
${conversationHistory}

Task:
Determine the NEXT question to ask the candidate.
Rules:
1. Check "blueprint.topics" status ("not_covered", "partially_covered", "covered"). Prioritize topics marked "not_covered" or "partially_covered" over topics marked "covered".
2. If candidate's last evaluation shows weakness (overallScore < 5.5), target the missing concept or weak area with a follow-up probing question at moderate difficulty.
3. If candidate's last evaluation was strong (overallScore >= 8.0), advance to an uncovered or higher-level topic in the blueprint.
4. If this is question #${totalQuestions - 1} or near the end and coding has not been covered, output a coding question.
5. Do NOT repeat any question present in the conversation history. Keep the question crisp, natural, professional, and conversational.

Return ONLY a valid JSON object:
{
  "question": "Question text to ask verbally...",
  "type": "<behavioral|technical|coding|resume>",
  "category": "Topic category",
  "recommendedDifficulty": "<Easy|Medium|Hard>",
  "adaptationReason": "Brief internal explanation of why this question was selected"
}
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
    EVALUATE_CODE_PROMPT,
    GENERATE_BLUEPRINT_PROMPT,
    EVALUATE_ANSWER_PROMPT,
    GENERATE_ADAPTIVE_QUESTION_PROMPT
};
