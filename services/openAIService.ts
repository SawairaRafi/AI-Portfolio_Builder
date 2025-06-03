import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL_NAME } from '../constants';
import { PortfolioData, GeneratedPortfolioContent } from '../types';

if (!OPENAI_API_KEY) {
  console.warn("OpenAI API Key is not configured. OpenAI features will be disabled.");
}

const openai = OPENAI_API_KEY 
  ? new OpenAI({ 
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // IMPORTANT: This is for client-side usage and exposes the API key.
                                   // For production, proxy API calls through your backend.
    }) 
  : null;

const generatePortfolioContentWithOpenAI = async (
  data: PortfolioData
): Promise<GeneratedPortfolioContent> => {
  if (!openai) {
    console.warn("OpenAI API not initialized. Returning mock content.");
    // Fallback or mock data if API key is missing
    return {
      enhancedBio: `This is a mock enhanced bio (OpenAI) for ${data.name}. Based on the provided information, this individual is a skilled ${data.title}.`,
      projectSummaries: data.projects.map(p => ({ name: p.name, summary: `Mock OpenAI summary for ${p.name}.` })),
      skillsKeywords: [...data.skills, "OpenAI Generated", "Mock Data"],
    };
  }

  const systemPrompt = `
You are an expert portfolio assistant. Analyze the following portfolio data and generate enhanced content.
The output MUST be a valid JSON object with the exact following structure:
{
  "enhancedBio": "string (a compelling, professionally rephrased biography, around 100-150 words)",
  "projectSummaries": [
    { "name": "string (project name)", "summary": "string (a concise, impactful summary for each project, 1-2 sentences)" }
  ],
  "skillsKeywords": ["string"] (a list of 5-10 key skills and technologies, extracted or inferred from the provided data)
}
Ensure the project names in "projectSummaries" exactly match the project names provided in the input data.
`;

  const userPrompt = `
    Portfolio Data:
    Name: ${data.name}
    Title: ${data.title}
    Current Bio: ${data.bio}
    Skills: ${data.skills.join(', ')}
    Projects:
    ${data.projects.map(p => `- Name: ${p.name}, Description: ${p.description}`).join('\n')}
    Experience:
    ${data.experience.map(e => `- ${e.role} at ${e.company}: ${e.description}`).join('\n')}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const jsonString = completion.choices[0]?.message?.content;
    if (!jsonString) {
      throw new Error("OpenAI response content is empty.");
    }
    
    const parsedData = JSON.parse(jsonString) as GeneratedPortfolioContent;

    // Validate structure slightly
    if (!parsedData.enhancedBio || !Array.isArray(parsedData.projectSummaries) || !Array.isArray(parsedData.skillsKeywords)) {
        throw new Error("OpenAI response does not match expected JSON structure.");
    }
    return parsedData;

  } catch (error) {
    console.error("Error generating portfolio content with OpenAI:", error);
    throw new Error(`Failed to generate AI content with OpenAI. ${ (error as Error).message }`);
  }
};

export const openAIService = {
  generatePortfolioContentWithOpenAI,
  isConfigured: () => !!OPENAI_API_KEY,
};