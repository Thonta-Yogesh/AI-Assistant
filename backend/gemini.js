const axios = require("axios");

const geminiResponse = async (command, assistantName, userName, lang = 'en-IN', chatHistory = []) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiUrl) { console.error("❌ GEMINI_API_URL not set"); return null; }

    const LANG_INSTRUCTIONS = {
      'hi-IN': `The user is speaking in HINDI. You MUST:
- Write your "response" ONLY in Hindi Devanagari script (हिंदी लिपि)
- Write a Romanized transliteration of the Hindi response in "responseRoman" (using English letters, e.g. "Main bilkul thik hoon, aap kaise hain?").
- Set "lang": "hi-IN"`,
      'te-IN': `The user is speaking in TELUGU. You MUST:
- Write your "response" ONLY in Telugu script (తెలుగు లిపి)
- Write a Romanized transliteration of the Telugu response in "responseRoman" (using English letters, e.g. "Nenu chala bagunnanu, meeru ela unnarru?").
- Set "lang": "te-IN"`,
      'en-IN': `The user is speaking in ENGLISH. Respond in clear English.
- Write the exact same English response in both "response" and "responseRoman".
- Set "lang": "en-IN"`,
    };

    const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS['en-IN'];

    let historyText = "";
    if (chatHistory && chatHistory.length > 0) {
      historyText = "\nRecent Conversation History (for context):\n" + chatHistory.map(m => {
        const sender = m.role === 'user' ? 'User' : 'Assistant';
        return `${sender}: ${m.text}`;
      }).join('\n') + "\n";
    }

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.

LANGUAGE INSTRUCTION (MANDATORY — HIGHEST PRIORITY):
${langInstruction}

Your task: understand the user's input and return a JSON object:
{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" |
          "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" |
          "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<user's input without assistant name>",
  "response": "<your response in the REQUIRED language script above>",
  "responseRoman": "<a Romanized/transliterated version using English alphabet so English voice engines can pronounce it>",
  "lang": "${lang}"
}

Type meanings:
- "general": factual/conversational — give the ACTUAL answer, not just "Sure".
- "google-search": user wants to Google something.
- "youtube-search" / "youtube-play": user wants YouTube.
- "calculator-open": open calculator.
- "instagram-open" / "facebook-open": open social media.
- "weather-show": weather — give climate knowledge + say opening live data.
- "get-time" / "get-date" / "get-day" / "get-month": date/time.

Rules:
- If asked who created you, include ${userName} in the response (in the required script).
- Output ONLY the JSON object. No markdown, no backticks, no extra text.
- CRITICAL: Read "Recent Conversation History" to maintain the flow of ongoing games, Q&A sessions, quizzes, or step-by-step questions. If the user previously asked you to do something sequential (like "ask me 10 questions"), follow up on their answer to the previous question and then output the next question in the sequence. Never ignore or break a flow that has already started.
${historyText}
User input: ${command}
`;



    const result = await axios.post(apiUrl, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.data.candidates[0].content.parts[0].text;

    return text; // raw response (JSON string)
  } catch (error) {
    console.error("❌ Gemini API error:", error.response?.data || error.message);
    return null;
  }
};

module.exports = geminiResponse;
