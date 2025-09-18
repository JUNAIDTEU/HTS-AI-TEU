
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

import { lookupHtsCode } from './htsLookupService';

export const streamGetHtsCode = async (
  commodityDescription: string,
  importCountry: string,
  systemInstruction: string,
) => {
  try {
    // First, get HTS information including annexes, tariffs, etc.
    const htsInfo = await lookupHtsCode(commodityDescription, importCountry);
    
    // Prepare context with HTS information
    let htsContext = '';
    if (htsInfo.mainResult) {
      htsContext = `
HTS Information:
${JSON.stringify(htsInfo.mainResult, null, 2)}
`;
    }

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: 'user',
          parts: [{ text: `${commodityDescription}

Import Country: ${importCountry}

${htsContext}` }]
        }
      ],
      config: {
        systemInstruction: `${systemInstruction}

When responding, always include the following sections if available:
1. Annex Information (I, II, III)
2. Exclusions & Exceptions
3. Additional Tariffs including:
   - Pentenyl tariff
   - Political IEEPA Brazil
   - Russian Oil IEEPA
   - Section 301
   - Section 232
   - Antidumping
   - Countervailing

Format the response with clear section headers using **Section Name** format.`,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    
    return response;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get response from Gemini API.");
  }
};