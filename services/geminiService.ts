import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { ChatMessage } from "../types";
import { searchLocalDictionary } from "../constants/dictionaryData";

const MODEL_NAME = "gemini-2.5-flash";

const setMetronomeSettingsDeclaration: FunctionDeclaration = {
  name: 'setMetronomeSettings',
  description: 'Configures the metronome BPM and time signature based on user request.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      bpm: {
        type: Type.NUMBER,
        description: 'The beats per minute (BPM). Default to 120 if not specified but genre implies speed.',
      },
      beatsPerBar: {
        type: Type.NUMBER,
        description: 'The numerator of the time signature (e.g., 3 for 3/4, 4 for 4/4, 6 for 6/8).',
      },
      noteValue: {
        type: Type.NUMBER,
        description: 'The denominator of the time signature (e.g., 4 for quarter notes, 8 for eighth notes).',
      },
      explanation: {
        type: Type.STRING,
        description: 'A very short, friendly explanation of why these settings were chosen.',
      }
    },
    required: ['bpm', 'beatsPerBar', 'noteValue', 'explanation'],
  },
};

export const parsePromptToSettings = async (
  prompt: string, 
  history: ChatMessage[]
): Promise<{ settings?: any, responseText: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct history for context
    const recentHistory = history.slice(-6).map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...recentHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are a helpful music assistant. Your goal is to help the user configure their metronome. Analyze their request (genre, style, or specific numbers) and call the tool `setMetronomeSettings`. If they ask something unrelated, just answer politely.",
        tools: [{ functionDeclarations: [setMetronomeSettingsDeclaration] }],
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return { responseText: "I couldn't process that request." };
    }

    const content = candidates[0].content;
    const parts = content.parts;
    
    let settings = null;
    let responseText = "";

    for (const part of parts) {
      if (part.functionCall) {
        if (part.functionCall.name === 'setMetronomeSettings') {
          settings = part.functionCall.args;
          if (settings.explanation) {
             responseText = settings.explanation;
          }
        }
      } else if (part.text) {
        responseText += part.text;
      }
    }

    if (settings && !responseText) {
        responseText = `Setting metronome to ${settings.bpm} BPM in ${settings.beatsPerBar}/${settings.noteValue}.`;
    }

    return { settings, responseText: responseText || "Settings updated." };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { responseText: "Sorry, I encountered an error connecting to the AI." };
  }
};

// New Service for Dictionary
export const getMusicalTermDefinition = async (term: string): Promise<string> => {
    // 1. Try Local Database FIRST (Instant)
    const localResult = searchLocalDictionary(term);
    if (localResult) {
        // Return immediately without network call
        return localResult + "\n\n*(資料來源：內建學術辭典)*"; 
    }

    // 2. Fallback to Gemini API
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                { role: 'user', parts: [{ text: `解釋音樂術語: "${term}"` }] }
            ],
            config: {
                systemInstruction: `你是一位專業的音樂術語辭典專家。
                參考標準：請優先參考「國家教育研究院」的學術名詞翻譯與定義。
                
                任務目標：
                1. 無論使用者輸入中文或英文，**一律使用繁體中文回答**。
                2. 如果使用者輸入英文，請提供中文翻譯；如果輸入中文，請提供原文（通常是義大利文、法文或德文）。
                3. 解釋需精確、學術，但也適合音樂學習者閱讀。
                
                回答結構範例：
                **術語**：[原文] / [繁體中文譯名]
                **語言**：[來源語言]
                **定義**：[參考國家教育研究院的定義]
                **演奏應用**：[在實際演奏中如何表現，例如速度的變化、強弱的控制等]`,
            }
        });

        if (response.candidates && response.candidates.length > 0) {
            return response.candidates[0].content.parts[0].text || "找不到該術語的定義。";
        }
        return "找不到該術語的定義。";

    } catch (error) {
        console.error("Dictionary API Error:", error);
        return "連線錯誤，無法取得資料。";
    }
};