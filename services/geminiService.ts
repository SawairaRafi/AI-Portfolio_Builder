
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL_NAME } from '../constants';
import { PortfolioData, GeneratedPortfolioContent } from '../types';

if (!GEMINI_API_KEY) {
  console.warn("Gemini API Key is not configured. AI features will be disabled.");
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const generatePortfolioContent = async (
  data: PortfolioData
): Promise<GeneratedPortfolioContent> => {
  if (!ai) {
    // Fallback or mock data if API key is missing
    console.warn("Gemini API not initialized. Returning mock content.");
    return {
      enhancedBio: `This is a mock enhanced bio for ${data.name}. Based on the provided information, this individual is a skilled ${data.title}.`,
      projectSummaries: data.projects.map(p => ({ name: p.name, summary: `Mock summary for ${p.name}.` })),
      skillsKeywords: [...data.skills, "AI Generated", "Mock Data"],
    };
  }

  const prompt = `
    Analyze the following portfolio data and generate enhanced content.
    The output MUST be a valid JSON object with the following structure:
    {
      "enhancedBio": "string (a compelling, professionally rephrased biography, around 100-150 words)",
      "projectSummaries": [
        { "name": "string (project name)", "summary": "string (a concise, impactful summary for each project, 1-2 sentences)" }
      ],
      "skillsKeywords": ["string"] (a list of 5-10 key skills and technologies, extracted or inferred)
    }

    Portfolio Data:
    Name: ${data.name}
    Title: ${data.title}
    Current Bio: ${data.bio}
    Skills: ${data.skills.join(', ')}
    Projects:
    ${data.projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}
    Experience:
    ${data.experience.map(e => `- ${e.role} at ${e.company}: ${e.description}`).join('\n')}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    let jsonStr = response?.text?.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
    const match = jsonStr?.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr as string) as GeneratedPortfolioContent;

    // Validate structure slightly
    if (!parsedData.enhancedBio || !Array.isArray(parsedData.projectSummaries) || !Array.isArray(parsedData.skillsKeywords)) {
        throw new Error("AI response does not match expected JSON structure.");
    }
    return parsedData;

  } catch (error) {
    console.error("Error generating portfolio content with Gemini:", error);
    throw new Error(`Failed to generate AI content. ${ (error as Error).message }`);
  }
};

export const geminiService = {
  generatePortfolioContent,
  isConfigured: () => !!GEMINI_API_KEY,
};
