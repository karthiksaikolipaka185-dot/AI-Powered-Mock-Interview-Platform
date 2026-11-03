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
    { "category": "Behavioral & Resume Deep Dive", "weightPercentage": 20, "plannedCount": 1 },
    { "category": "Core Architecture & Concepts", "weightPercentage": 35, "plannedCount": 2 },
    { "category": "Domain Deep Dive", "weightPercentage": 25, "plannedCount": 1 },
    { "category": "Coding Challenge", "weightPercentage": 20, "plannedCount": 1 }
  ],
  "focusAreas": ["string", "string"]
}
`;

const EVALUATE_ANSWER_PROMPT = (...args) => {
    let params;
    if (typeof args[0] === 'object' && args[0] !== null) {
        params = args[0];
    } else {
        // Legacy parameter order: (currentQuestion, userAnswer, role, currentDifficulty)
        params = {
            questionText: args[0],
            answerText: args[1],
            jobRole: args[2],
            currentDifficulty: args[3],
            resumeSummary: '',
            topic: 'General',
            type: 'technical',
            answeredCount: 0,
            avgTechnicalScore: 0,
            topicsCovered: [],
            weaknesses: []
        };
    }

    const {
        jobRole,
        currentDifficulty,
        resumeSummary,
        questionText,
        topic,
        type,
        answerText,
        answeredCount = 0,
        avgTechnicalScore = 0,
        topicsCovered = [],
        weaknesses = []
    } = params;

    return `You are an expert technical interviewer evaluating a candidate's answer.

JOB ROLE: ${jobRole}
INTERVIEW DIFFICULTY: ${currentDifficulty}
CANDIDATE RESUME SUMMARY: ${resumeSummary || 'No candidate resume available'}

QUESTION ASKED: ${questionText}
QUESTION TOPIC: ${topic || 'General'}
QUESTION TYPE: ${type || 'technical'}

CANDIDATE'S ANSWER: ${answerText}

PREVIOUS PERFORMANCE SUMMARY:
- Questions answered so far: ${answeredCount}
- Average technical score: ${avgTechnicalScore}
- Topics covered: ${(topicsCovered || []).join(', ')}
- Identified weaknesses: ${(weaknesses || []).join(', ')}

Evaluate the answer and respond with ONLY valid JSON (no markdown, no explanation):
{
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "relevanceScore": <0-100>,
  "depthScore": <0-100>,
  "overallScore": <0-100>,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingConcepts": ["..."],
  "areasForFurtherAssessment": ["..."],
  "evaluationSummary": "...",
  "topicsCovered": ["..."]
}`;
};

const RESUME_ANALYSIS_PROMPT = (rawText) => `
You are an expert technical recruiter analyzing a candidate's resume text.
Extract the structured entities into a strictly valid JSON object.

Resume Text:
${rawText}

Return JSON with this exact shape:
{
  "workExperience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "duration": "Duration / Dates",
      "keyAchievements": ["Achievement 1", "Achievement 2"],
      "techStack": ["Technology 1", "Technology 2"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Brief description of architectural role and purpose",
      "techStack": ["React", "Node.js", "MongoDB"],
      "impactMetrics": ["Improved performance by 40%", "Scaled to 10k users"]
    }
  ],
  "technicalSkills": [
    {
      "category": "Languages / Frameworks / Cloud",
      "skills": ["JavaScript", "Python", "Docker"]
    }
  ],
  "verifiableClaims": [
    {
      "claimText": "Specific metric or architectural claim from resume",
      "metric": "40% performance gain",
      "context": "MongoDB query optimization"
    }
  ]
}
`;

const RESUME_DEEP_DIVE_PROMPT = (role, parsedResumeJson, currentDifficulty) => `
You are an expert technical interviewer probing a candidate's resume for the role of "${role}" at difficulty "${currentDifficulty}".

Candidate Resume Intelligence Model:
${JSON.stringify(parsedResumeJson)}

Task:
Generate a targeted, probing interview question that asks the candidate to explain the architectural decisions, trade-offs, tech stack, or verifiable claims from one of their specific projects or work experiences.

Return strictly valid JSON:
{
  "question": "Probing deep dive question explicitly citing a project or claim from candidate's resume...",
  "type": "resume",
  "category": "Behavioral & Resume Deep Dive",
  "recommendedDifficulty": "${currentDifficulty}",
  "adaptationReason": "Probing specific candidate project architectural trade-offs from resume"
}
`;

const GENERATE_ADAPTIVE_QUESTION_PROMPT = (...args) => {
    let params;
    if (typeof args[0] === 'object' && args[0] !== null) {
        params = args[0];
    } else {
        // Legacy parameter order:
        // (role, currentDifficulty, blueprintJson, trackerJson, lastEvalJson, conversationHistory, currentQuestionNum, totalQuestions, parsedResumeJson)
        params = {
            jobRole: args[0],
            currentDifficulty: args[1],
            blueprint: args[2],
            performanceTracker: args[3],
            lastEval: args[4],
            conversationHistory: args[5],
            currentQuestionNumber: args[6],
            totalQuestions: args[7],
            parsedResumeJson: args[8]
        };
    }

    const {
        jobRole,
        interviewType = 'Technical Interview',
        initialDifficulty = 'Medium',
        currentDifficulty = 'Medium',
        currentQuestionNumber = 1,
        totalQuestions = 5,
        resumeText = '',
        blueprint = {},
        previousQAs = [],
        topicsCovered = [],
        remainingTopics = [],
        performanceTrend = 'stable',
        weakAreas = [],
        resumeProject = null
    } = params;

    const formattedPreviousQAs = previousQAs.length > 0
        ? previousQAs.map((q, i) => `
Q${i+1} [${q.topic || q.category || 'General'}] [${q.difficulty || currentDifficulty}]: ${q.question}
Answer: ${q.answer || 'No answer provided'}
Evaluation: Technical=${q.evaluation?.technicalScore ?? 'N/A'}, Communication=${q.evaluation?.communicationScore ?? 'N/A'}
Strengths: ${(q.evaluation?.strengths || []).join(', ')}
Weaknesses: ${(q.evaluation?.weaknesses || []).join(', ')}
Missing: ${(q.evaluation?.missingConcepts || []).join(', ')}
`).join('\n')
        : 'None yet (First adaptive question).';

    return `You are an expert adaptive technical interviewer.

INTERVIEW CONTEXT:
- Job Role: ${jobRole}
- Interview Type: ${interviewType}
- Initial Difficulty: ${initialDifficulty}  
- Current Adaptive Difficulty: ${currentDifficulty}
- Question ${currentQuestionNumber} of ${totalQuestions}

CANDIDATE RESUME:
${resumeText || 'No resume text available.'}

INTERVIEW BLUEPRINT:
${typeof blueprint === 'object' ? JSON.stringify(blueprint) : (blueprint || '{}')}

PREVIOUS QUESTIONS AND ANSWERS:
${formattedPreviousQAs}

TOPICS ALREADY COVERED: ${(topicsCovered || []).join(', ')}
TOPICS REMAINING: ${(remainingTopics || []).join(', ')}

PERFORMANCE TREND: ${performanceTrend} (improving/declining/stable)
CURRENT WEAK AREAS: ${(weakAreas || []).join(', ')}

INSTRUCTIONS:
1. Generate ONE interview question appropriate for ${currentDifficulty} difficulty
2. Do NOT repeat any question already asked (see previous questions above)
3. Do NOT ask about topics already sufficiently covered unless exploring a weakness
4. If the candidate showed weakness in ${(weakAreas || []).slice(0, 2).join(', ') || 'an area'}, probe deeper with an appropriate question
5. If the candidate mentioned ${resumeProject || 'a key project'}, ask a relevant follow-up
6. Move to remaining topics: ${(remainingTopics || []).join(', ')}
7. The question should naturally follow from the conversation

Respond with ONLY valid JSON:
{
  "question": "...",
  "topic": "...",
  "type": "technical|behavioral|situational",
  "difficulty": "Easy|Medium|Hard",
  "purpose": "why this question is being asked",
  "followUpOf": null
}`;
};

const EVALUATE_CODE_PROMPT = (question, code) => `
Evaluate the following code submission for the question: "${question}".
Code:
${code}
`;

const EVALUATE_CLAIM_EVIDENCE_PROMPT = (claimText, question, candidateAnswer, answerEval) => `
You are an objective technical auditor evaluating candidate interview evidence against a specific claim or project from their resume.

Resume Claim / Project Context:
"${claimText}"

Interview Question Asked:
"${question}"

Candidate Answer Provided:
"${candidateAnswer}"

Answer Evaluation Metrics:
Technical Score: ${answerEval?.technicalScore || 'N/A'}/10
Depth Rating: ${answerEval?.depthRating || 'N/A'}

Task:
Determine how well the candidate's response supports their resume claim using neutral, evidence-based criteria.
Do NOT use judgmental words like "fake", "liar", "fraud", or "dishonest".

Allowed Statuses:
- "supported": Candidate demonstrated concrete technical depth, architectural understanding, and hands-on detail matching the claim.
- "partially_supported": Candidate demonstrated general familiarity, but lacked granular implementation details or metrics.
- "insufficient_evidence": Candidate answer was too brief, surface-level, or skipped detail necessary to evaluate the claim.
- "needs_clarification": Candidate response diverged from stated technologies or metric claims, requiring further clarification.

Return strictly valid JSON:
{
  "evidenceStatus": "<supported|partially_supported|insufficient_evidence|needs_clarification>",
  "reasoning": "1-2 sentence neutral explanation of evidence match",
  "extractedEvidence": ["Short technical detail or metric cited by candidate"],
  "confidenceRating": <number 0.0 to 1.0>
}
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
    RESUME_ANALYSIS_PROMPT,
    RESUME_DEEP_DIVE_PROMPT,
    GENERATE_ADAPTIVE_QUESTION_PROMPT,
    EVALUATE_CLAIM_EVIDENCE_PROMPT
};
