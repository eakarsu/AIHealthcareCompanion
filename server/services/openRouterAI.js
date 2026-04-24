import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function callOpenRouterAI(systemPrompt, userMessage) {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Healthcare Companion'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 10000
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenRouter API Error:', data.error);
      return { error: data.error.message || 'AI service error' };
    }

    return {
      content: data.choices?.[0]?.message?.content || 'No response generated',
      model: data.model,
      usage: data.usage
    };
  } catch (error) {
    console.error('OpenRouter AI Error:', error);
    return { error: error.message };
  }
}

// AI Prompts for each feature
export const AI_PROMPTS = {
  medicationInteraction: `You are an expert pharmacist AI assistant. Analyze the following medication information and provide:
1. Potential drug interactions
2. Safety concerns
3. Recommended timing for doses
4. Foods or activities to avoid
5. Important warnings

Format your response in a clear, professional manner with sections. Be thorough but concise.`,

  physicalTherapyForm: `You are an expert physical therapist AI assistant. Based on the exercise description provided, give:
1. Proper form instructions
2. Common mistakes to avoid
3. Modifications for different fitness levels
4. Safety precautions
5. Tips for maximum benefit

Format your response professionally with clear sections.`,

  skinAnalysis: `You are a dermatology AI assistant. Based on the skin condition description provided, give:
1. Possible conditions (with disclaimer about professional diagnosis)
2. General care recommendations
3. When to seek medical attention
4. Home care tips
5. Risk assessment

IMPORTANT: Always recommend consulting a healthcare professional for proper diagnosis. Format your response professionally.`,

  visionAnalysis: `You are an optometry AI assistant. Based on the vision test results provided, give:
1. Interpretation of results
2. General eye health recommendations
3. When to see an eye care professional
4. Lifestyle tips for eye health
5. Potential concerns to discuss with a doctor

Format your response professionally with clear sections.`,

  medicalHistoryInsights: `You are a medical AI assistant specializing in patient history analysis. Based on the medical history provided, give:
1. Key health patterns observed
2. Potential risk factors
3. Recommended screenings or tests
4. Lifestyle recommendations
5. Questions to discuss with healthcare providers

IMPORTANT: This is for informational purposes only. Always consult healthcare professionals for medical advice. Format your response professionally.`
};
