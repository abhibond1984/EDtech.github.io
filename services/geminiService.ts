
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, TextbookAnalysis, SketchStyle, DifficultyLevel, GradeLevel, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async analyzeTextbookPage(
    imageBase64: string, 
    grade: GradeLevel,
    difficulty: DifficultyLevel = 'similar'
  ): Promise<TextbookAnalysis> {
    const prompt = `You are a world-class educational curriculum researcher and textbook author.
    Step 1: Use Google Search to research common ${grade} level curriculum standards and typical question formats for the topic shown in this textbook page.
    Step 2: Generate AT LEAST 10 high-quality practice questions that look and feel like they belong in a professional ${grade} textbook.
    
    Difficulty Context: ${difficulty === 'easy' ? 'Scaffolded/Foundational' : difficulty === 'difficult' ? 'Advanced/Critical Thinking' : 'Grade-appropriate'}.
    Grade Level: ${grade}.
    
    The questions should vary in type (Multiple Choice, True/False, and Short Answer).
    
    For EACH question, provide an "illustrationPrompt" for a simple, clear educational diagram or sketch that supports visual learning.
    
    Return the result strictly in JSON format.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            summary: { type: Type.STRING },
            funFact: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              minItems: 10,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['multiple-choice', 'short-answer', 'true-false'] },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  illustrationPrompt: { type: Type.STRING, description: "Description for a pedagogical sketch." },
                },
                required: ['text', 'type', 'correctAnswer', 'explanation', 'illustrationPrompt']
              }
            }
          },
          required: ['subject', 'topic', 'summary', 'funFact', 'questions']
        },
      },
    });

    try {
      const data = JSON.parse(response.text);
      
      // Extract grounding sources
      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
        });
      }

      data.questions = data.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${index}`
      }));
      
      return { ...data, sources };
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("The research engine found the material too complex or the photo was unclear. Please try again! 📸");
    }
  }

  async generateIllustration(prompt: string, style: SketchStyle = 'pencil'): Promise<string> {
    let styleDescription = '';
    switch (style) {
      case 'watercolor':
        styleDescription = 'Artistic watercolor wash, soft edges, educational illustration style. Minimalist.';
        break;
      case 'chalkboard':
        styleDescription = 'Chalk on blackboard drawing, dusty textures, educational diagram style.';
        break;
      case 'crayon':
        styleDescription = 'Crayon drawing, waxy texture, bright colors, friendly educational sketch.';
        break;
      default:
        styleDescription = 'Clear, professional pencil sketch on paper, technical drawing style for textbooks.';
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Style: ${styleDescription} Content: ${prompt}. No text in image.` },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Sketching error!");
  }
}

export const geminiService = new GeminiService();
