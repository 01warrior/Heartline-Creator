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
    contents: `Write a romantic, emotional, and deep poem about the topic: "${topic}". 
    It should be in the style of highly engaging TikTok/Reels poetry accounts like 'Heartlines', where each line evokes a strong feeling.
    Split the poem into 6-8 distinct phrases (each phrase will be a separate scene).
    Make each phrase a normal sentence length (about 6-12 words each) to keep it concise and impactful.
    Language: French or English based on the topic.
    The tone must be: romantic, quiet, deep, emotionally resonant.`,
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

export async function generateFullPoemAudio(apiKey: string, fullText: string, model: string = 'gemini-3.1-flash-tts-preview', voiceName: string = 'Kore'): Promise<{data: string, mimeType: string}> {
  const ai = getAI(apiKey);
  
  const response = await ai.models.generateContent({
    model: model,
    contents: [{ 
      parts: [{ 
        text: `Read this poem with a romantic, poetic voice. 
        Speak at a normal, natural poetry-reading pace (not too slow). 
        You can convey emotion through tone rather than just speaking slowly.
        
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

  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (inlineData?.data) {
    return { data: inlineData.data, mimeType: inlineData.mimeType || 'audio/wav' };
  }
  
  throw new Error("Failed to generate full audio.");
}

export function audioDataToBlob(base64Data: string, mimeType: string): Blob {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // If the model actually returned raw PCM, format it to WAV for the browser to play it via <audio> tags
  if (mimeType.toLowerCase().includes('pcm') || !mimeType || mimeType === 'audio/wav') {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bytes.length, true);
    writeString(view, 8, 'WAVE');
    
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    writeString(view, 36, 'data');
    view.setUint32(40, bytes.length, true);
    
    return new Blob([wavHeader, bytes], { type: 'audio/wav' });
  }
  
  return new Blob([bytes], { type: mimeType });
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
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      let audioBuffer: AudioBuffer;
      
      try {
        // Try decoding as standard format (WAV, MP3, etc.)
        audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
      } catch (decodeErr) {
        // If it fails, assume it's raw 16-bit 24kHz PCM and decode manually
        const sampleRate = 24000;
        const pcmBuffer = new Int16Array(bytes.buffer);
        const float32Buffer = new Float32Array(pcmBuffer.length);
        for(let i=0; i<pcmBuffer.length; i++) {
          float32Buffer[i] = pcmBuffer[i] / 32768.0;
        }
        audioBuffer = audioContext.createBuffer(1, float32Buffer.length, sampleRate);
        audioBuffer.copyToChannel(float32Buffer, 0);
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      const duration = audioBuffer.duration;
      let startTime: number | undefined;

      const updateProgress = () => {
        if (startTime === undefined) return;
        const elapsed = audioContext.currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        if (onProgress) onProgress(progress);
        if (progress < 100) {
          requestAnimationFrame(updateProgress);
        }
      };

      source.onended = () => resolve();
      source.start(0);
      startTime = audioContext.currentTime;
      updateProgress();
    } catch(e) {
      reject(e);
    }
  });
}
