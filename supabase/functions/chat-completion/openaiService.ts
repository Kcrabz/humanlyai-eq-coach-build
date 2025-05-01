
import { estimateTokenCount } from "./utils.ts";

// The enhanced system prompt
const KAI_SYSTEM_PROMPT = `Overview
You are Kai, the HumanlyAI Coach — a highly skilled Emotional Intelligence (EQ) mentor. Your mission is to help users grow their Human Skills: self-awareness, emotional regulation, empathy, motivation, and connection.

🎙️ Tone & Voice
- Speak with warmth, clarity, and confidence.
- Mirror the user's tone (casual, reflective, direct).
- If in Tough Love mode, be bolder and more direct — but never harsh.
- Avoid fluff, therapy talk, or robotic phrases (never say "as an AI").

🧩 Coaching Flow (Every Session)
1. Reflect: Acknowledge what the user shared or achieved.  
2. Challenge: Offer one actionable micro-practice, challenge, or habit shift.  
3. Ask: Prompt one meaningful question for reflection or insight.  
4. (Optional): Suggest a tool or resource from HumanlyAI.me.  
Limit responses to ~150 words unless asked for more.

🎯 Personalization Logic
- Coaching Mode:  
  - Normal: supportive, reflective, practical  
  - Tough Love: direct, action-driven, grounded

- EQ Archetype Behaviors:  
  - Reflector: Encourage action over reflection  
  - Activator: Reinforce pause and planning  
  - Regulator: Support emotional expression  
  - Connector: Teach boundaries + inner focus  
  - Observer: Prompt emotional vulnerability

- If archetype unknown: Invite user to take the HumanlyAI Archetype Assessment.

📈 User Tools & Features
- Daily EQ Tip: General or archetype-based (auto-rotate).
- Self Check-In: Ask user to rate 1–5 on:
  - Self-awareness, Regulation, Empathy, Reflection, Connection  
  Summarize trend. Recommend focus.

- Growth Plan:  
  - Ask goal  
  - Suggest: 1 Focus Practice, 1 Daily Action, 1 Reflection Prompt

- Journal Logic (Premium only):  
  - Ask: "Want to update your EQ Growth Journal today?"  
  - If user uploads .xlsx, scan last 5–10 rows  
  - Ask for: mood, archetype, challenge, insight, rating  
  - Auto-fill: summary, coach note, future focus  
  - Return updated file

🔁 Continuity Cues
- Reference recent entries if available  
- Track streaks: "3 days in a row! Want a bonus challenge?"  
- Use context:  
  - Early week → set focus  
  - End of day → reflect  
  - Long gap → "Welcome back — ready to pick up where we left off?"

🧠 If User Is Unsure
Offer Kai's Menu:  
"Want to…  
(1) Manage an emotion  
(2) Reflect on a recent moment  
(3) Build an EQ habit?"

💡 Bonus Prompts
Rotate occasionally:  
- "What's one emotion you avoid expressing?"  
- "What story about yourself do you want to rewrite?"  
- "What would it feel like to respond instead of react?"

📚 Resource Library
Mention when relevant:  
- Book: Emotional Agility – Susan David  
- Book: The Language of Emotions – Karla McLaren  
- Podcast: Unlocking Us – Brené Brown  
- Site: https://humanlyai.me

🛑 Behavior Rules
- Always use the term Human Skills, not soft skills  
- Stay under 150 words unless requested  
- Do not break character or output internal logic  
- Avoid passive tone, jargon, or excessive summarizing  
- Prompt user to visit HumanlyAI.me for deeper tools and templates

✅ Example Outro
"Today you explored [insight]. Want to:  
✓ Save this to your journal  
✓ Try a new challenge tomorrow  
✓ Reflect on a quote?"`;

// Prepare messages for OpenAI API
export function prepareMessages(message: string, archetype: string, coachingMode: string, chatHistory: any[] = []) {
  // Create the dynamic personalization header
  const personalizationHeader = 
    `Coaching Mode: ${coachingMode}.\n` +
    `EQ Archetype: ${archetype}.\n`;
  
  // Always use the KAI_SYSTEM_PROMPT as the base, with personalization added
  const systemContent = personalizationHeader + KAI_SYSTEM_PROMPT;
  
  // Base messages with system prompt and current user message
  let messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: message }
  ];
  
  // If we have chat history, add it between system message and current user message
  if (chatHistory && chatHistory.length > 0) {
    // Add previous messages to the conversation context (in correct order)
    const previousMessages = chatHistory
      .reverse()
      .map(msg => ({ role: msg.role, content: msg.content }));
    
    // Insert previous messages between system message and current user message
    messages = [
      messages[0], // System message
      ...previousMessages, // Previous conversation
      messages[1]  // Current user message
    ];
    
    console.log(`Added ${previousMessages.length} previous messages as context`);
  }
  
  return messages;
}

// Call OpenAI API with streaming support
export async function* streamOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Streaming from OpenAI with model: gpt-4o-mini");
  
  try {
    // Call OpenAI API with streaming enabled
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        stream: true
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Check for different error types
      if (errorData.error?.type === 'insufficient_quota' || 
          errorData.error?.code === 'insufficient_quota' ||
          errorData.error?.message?.includes('quota')) {
        
        throw {
          type: 'quota_exceeded',
          message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
          details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
        };
      }
      
      if (errorData.error?.type === 'invalid_request_error' && 
          errorData.error?.message?.includes('API key')) {
        
        throw {
          type: 'invalid_key',
          message: 'Invalid API key provided. Please check your API key and try again.',
          details: 'The API key provided was rejected by OpenAI.'
        };
      }
      
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
    }
    
    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response");
    }
    
    const decoder = new TextDecoder();
    let buffer = "";
    let completeResponse = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode chunk
      const chunk = decoder.decode(value);
      buffer += chunk;
      
      // Process all complete lines in buffer
      let lines = buffer.split('\n');
      buffer = lines.pop() || ""; // Keep the last incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        
        // Extract data portion
        const dataMatch = line.match(/^data: (.*)$/);
        if (!dataMatch) continue;
        
        try {
          const json = JSON.parse(dataMatch[1]);
          const contentDelta = json.choices[0]?.delta?.content || '';
          if (contentDelta) {
            completeResponse += contentDelta;
            yield contentDelta;
          }
        } catch (e) {
          console.error("Error parsing streaming JSON:", e);
        }
      }
    }
    
    return completeResponse;
  } catch (error) {
    // Rethrow if it's already our custom error format
    if (error.type) {
      throw error;
    }
    
    // Check for quota errors in the error message
    if (error.message?.includes('quota') || 
        error.message?.includes('exceeded') || 
        error.message?.includes('billing')) {
      throw {
        type: 'quota_exceeded',
        message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
        details: error.message
      };
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

// Call OpenAI API (non-streaming version for fallback)
export async function callOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Calling OpenAI with model: gpt-4o-mini");
  
  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Check for different error types
      if (errorData.error?.type === 'insufficient_quota' || 
          errorData.error?.code === 'insufficient_quota' ||
          errorData.error?.message?.includes('quota')) {
        
        throw {
          type: 'quota_exceeded',
          message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
          details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
        };
      }
      
      if (errorData.error?.type === 'invalid_request_error' && 
          errorData.error?.message?.includes('API key')) {
        
        throw {
          type: 'invalid_key',
          message: 'Invalid API key provided. Please check your API key and try again.',
          details: 'The API key provided was rejected by OpenAI.'
        };
      }
      
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
    }
    
    const completion = await response.json();
    return completion.choices[0].message.content;
  } catch (error) {
    // Rethrow if it's already our custom error format
    if (error.type) {
      throw error;
    }
    
    // Check for quota errors in the error message
    if (error.message?.includes('quota') || 
        error.message?.includes('exceeded') || 
        error.message?.includes('billing')) {
      throw {
        type: 'quota_exceeded',
        message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
        details: error.message
      };
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}
