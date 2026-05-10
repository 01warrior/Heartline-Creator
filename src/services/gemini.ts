import { GoogleGenAI, Type, Modality } from '@google/genai';

export interface PoemLine {
  text: string;
}

function getAI(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function generatePoem(apiKey: string, topic: string, model: string = 'gemini-3.1-pro-preview'): Promise<string[]> {
  const ai = getAI(apiKey);
  
  const response = await ai.models.generateContent({
    model: model,
    contents: `Write a romantic, emotional, and deep 30-second poem about the topic: "${topic}". 
    It should be in the style of highly engaging TikTok poetry accounts like 'Heartlines', where each line evokes a strong feeling.
    Split the poem into 5-8 short, distinct phrases (each phrase will be a separate scene).
    Language: French or English based on the topic. If the topic is French, write French. If english, write english. 
    The tone must be: romantic, quiet, deep, emotional.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    }
  });

  try {
    const rawText = response.text || "[]";
    const phrases: string[] = JSON.parse(rawText);
    return phrases;
  } catch (e) {
    console.error("Failed to parse poem", e);
    throw new Error("Failed to parse the generated poem.");
  }
}

export async function generateImageForPhrase(apiKey: string, phrase: string, stylePrompt: string, model: string = 'gemini-2.5-flash-image'): Promise<string> {
  const ai = getAI(apiKey);
  
  const prompt = `Act as a cinematic art director. Create a consistent visual for a poetry video.
  SCENE PHRASE: "${phrase}"
  VISUAL STYLE: ${stylePrompt}
  
  TECHNICAL REQUIREMENTS:
  - Maintain a strict visual continuity with the style mentioned above.
  - Lighting: Dramatic, moody, intentional shadows.
  - Composition: Rule of thirds, cinematic depth of field (blurred background).
  - Quality: 4k, masterpiece, ultra-realistic textures, no text or watermarks.
  - Mood: Highly emotional and atmospheric.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
}

export async function generateTopicSuggestions(apiKey: string, model: string = 'gemini-3-flash-preview'): Promise<string[]> {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: model,
    contents: `Act as a creative director for a TikTok poetry account named 'Heartlines'. 
    Generate 5 short, deeply emotional, and evocative poem titles or themes.
    It should appeal to modern viewers who love atmospheric, cinematic, and slightly melancholic stories.
    Max 6 words per suggestion. Examples: 'The taste of a ghost', 'Architecture of unrequited love', 'When the rain chose us'.
    Return them as a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    }
  });

  try {
    const rawText = response.text || "[]";
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse suggestions", e);
    return [response.text().replace(/"/g, '').trim()];
  }
}

export const AVAILABLE_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede'];

export async function generateFullPoemAudio(apiKey: string, fullText: string, model: string = 'gemini-3.1-flash-tts-preview', voiceName: string = 'Kore'): Promise<string> {
  const ai = getAI(apiKey);
  
  const response = await ai.models.generateContent({
    model: model,
    contents: [{ 
      parts: [{ 
        text: `Read this poem with a deep, romantic, and poetic voice. 
        Speak slowly. 
        IMPORTANT: Take a 2-second breath/pause after each line/phrase. 
        The total duration should be around 30 seconds.
        
        Poem:
        ${fullText}` 
      }] 
    }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return base64Audio;
  }
  
  throw new Error("Failed to generate full audio.");
}

export async function playPcmAudio(base64Data: string, onProgress?: (percent: number) => void): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = new Int16Array(bytes.buffer);
      const float32Buffer = new Float32Array(buffer.length);
      for(let i=0; i<buffer.length; i++) {
        float32Buffer[i] = buffer[i] / 32768.0;
      }
      
      const audioBuffer = audioContext.createBuffer(1, float32Buffer.length, 24000);
      audioBuffer.copyToChannel(float32Buffer, 0);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      const duration = audioBuffer.duration;
      let startTime: number;

      const updateProgress = () => {
        if (!startTime) return;
        const elapsed = audioContext.currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        if (onProgress) onProgress(progress);
        if (progress < 100) {
          requestAnimationFrame(updateProgress);
        }
      };

      source.onended = () => {
        resolve();
      };
      
      source.start();
      startTime = audioContext.currentTime;
      updateProgress();
    } catch(e) {
      reject(e);
    }
  });
}
