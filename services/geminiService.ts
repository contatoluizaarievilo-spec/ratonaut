import { GoogleGenAI } from "@google/genai";

// --- Initialization ---
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Chat & Coaching ---
export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  mode: 'fast' | 'complex' | 'search' | 'maps',
  onChunk: (text: string, grounding?: any) => void
) => {
  let modelName = 'gemini-3-pro-preview';
  let tools: any[] = [];
  let toolConfig: any = undefined;
  let thinkingConfig: any = undefined;

  // Configure based on mode
  if (mode === 'fast') {
    modelName = 'gemini-2.5-flash-lite-latest';
  } else if (mode === 'search') {
    modelName = 'gemini-2.5-flash';
    tools = [{ googleSearch: {} }];
  } else if (mode === 'maps') {
    modelName = 'gemini-2.5-flash';
    tools = [{ googleMaps: {} }];
    // Attempt to get location for better maps grounding
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
            }
        };
    } catch (e) {
        console.warn("Could not get location for Maps grounding", e);
    }
  } else if (mode === 'complex') {
    modelName = 'gemini-3-pro-preview';
    thinkingConfig = { thinkingBudget: 32768 };
  }

  const chat = ai.chats.create({
    model: modelName,
    history: history,
    config: {
      tools: tools.length > 0 ? tools : undefined,
      toolConfig: toolConfig,
      thinkingConfig: thinkingConfig,
    }
  });

  const resultStream = await chat.sendMessageStream({ message });

  for await (const chunk of resultStream) {
    // Extract text
    if (chunk.text) {
      onChunk(chunk.text, undefined);
    }
    
    // Extract grounding metadata if present (for Search/Maps)
    const grounding = chunk.candidates?.[0]?.groundingMetadata;
    if (grounding) {
       // Just pass the whole object, the UI will parse chunks
       onChunk("", grounding);
    }
  }
};

// --- TTS ---
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text }] },
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

// --- Audio Transcription ---
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType, data: audioBase64 } },
                { text: "Transcribe this audio strictly. Do not add commentary." }
            ]
        }
    });
    return response.text || "";
};

// --- Video Understanding ---
export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { mimeType, data: videoBase64 } },
                { text: prompt }
            ]
        }
    });
    return response.text || "";
};

// --- Stability & Gait Analysis ---
export const analyzeGaitPattern = async (statsPrompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: statsPrompt }] }
    });
    return response.text || "Analysis incomplete.";
};