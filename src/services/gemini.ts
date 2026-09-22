import { GoogleGenAI, Type, Modality } from '@google/genai';

export interface PoemLine {
  text: string;
}

function getAI(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function generatePoem(apiKey: string, topic: string, model: string = 'gemini-3.1-pro-preview', sceneCountMin: number = 6, sceneCountMax: number = 8): Promise<string[]> {
  const ai = getAI(apiKey);
  
  const response = await ai.models.generateContent({
    model: model,
    contents: `Write a romantic, emotional, and deep poem about the topic: "${topic}". 
    It should be in the style of highly engaging TikTok/Reels poetry accounts like 'Heartlines', where each line evokes a strong feeling.
    Split the poem into ${sceneCountMin}-${sceneCountMax} distinct phrases (each phrase will be a separate scene).
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
    return [(response.text || "").replace(/"/g, '').trim()];
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

  // Debugging: Identify real file type
  const headerStr = String.fromCharCode(...Array.from(bytes.subarray(0, 16)));
  console.log(`[Audio] Gemini API provided mimetype: ${mimeType}`);
  console.log(`[Audio] Magic Bytes: ${Array.from(bytes.subarray(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);

  // If the data already has a RIFF WAVE header, it is already a valid WAV file.
  if (headerStr.startsWith('RIFF') && headerStr.includes('WAVE')) {
    console.log('[Audio] Detected clean WAV');
    return new Blob([bytes], { type: 'audio/wav' });
  }
  
  if (headerStr.startsWith('ID3') || (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0)) {
    console.log('[Audio] Detected MP3');
    return new Blob([bytes], { type: 'audio/mp3' });
  }
  
  if (headerStr.includes('OggS')) {
    console.log('[Audio] Detected OGG');
    return new Blob([bytes], { type: 'audio/ogg' });
  }

  // If the model actually returned raw PCM, format it to WAV for the browser to play it via <audio> tags
  // AND only wrap it if we didn't identify it as another format!
  if (mimeType.toLowerCase().includes('pcm') || mimeType.toLowerCase().includes('l16') || mimeType === 'audio/wav' || !mimeType) {
    console.log('[Audio] Wrapping raw PCM in WAV header');
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
  
  console.log('[Audio] Fallback to provided mimetype:', mimeType);
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

export interface StoryboardContinuationContext {
  episodeNumber: number;
  seriesTitle?: string;
  previousStory: string;
  previousCharacters: Array<{
    name: string;
    description: string;
    visualBlock: string;
    imagePrompt: string;
  }>;
  previousScenes: Array<{
    sceneNumber: number;
    frenchSummary?: string;
    imagePrompt: string;
    videoPrompt: string;
  }>;
}

export async function generateStoryboard(
  apiKey: string,
  modelName: string,
  story: string,
  style: string,
  sceneCount: number,
  sceneDuration: number,
  continuation?: StoryboardContinuationContext,
  dialogueLanguage: 'fr' | 'en' = 'fr'
): Promise<any> {
  const ai = getAI(apiKey);

  const langLabel = dialogueLanguage === 'en' ? 'ENGLISH' : 'FRENCH';
  const langDialogueExample = dialogueLanguage === 'en' 
    ? 'the character speaks with a trembling voice, saying: "Exact spoken dialogue line in English here"'
    : 'the character speaks with a trembling voice, saying: "Ligne de dialogue exacte en français ici"';
  const langDescNote = dialogueLanguage === 'en' ? 'English description' : 'Description en français';

  let continuationInstructions = '';
  if (continuation && continuation.episodeNumber > 1) {
    const charactersList = (continuation.previousCharacters || [])
      .map((c) => `- ${c.name} (${c.description}): visualBlock = "${c.visualBlock}"`)
      .join('\n');

    const scenesSummary = (continuation.previousScenes || [])
      .map((s) => `  * Scene ${s.sceneNumber}: ${s.frenchSummary || 'Action'}`)
      .join('\n');

    const lastScene = continuation.previousScenes && continuation.previousScenes.length > 0 
      ? continuation.previousScenes[continuation.previousScenes.length - 1]
      : null;

    continuationInstructions = `
  ======================================================================
  CRITICAL: MULTI-PART EPISODIC CONTINUATION (EPISODE ${continuation.episodeNumber})
  ======================================================================
  You are writing EPISODE ${continuation.episodeNumber} of an ongoing series!

  1. ESTABLISHED CHARACTERS (VISUAL CONSISTENCY MANDATE):
  The following characters already exist from previous episodes. If any of them appear in this episode, you MUST REUSE THEIR EXACT 'visualBlock' word-for-word to guarantee 100% visual consistency:
${charactersList || 'None specified.'}

  2. SUMMARY OF PREVIOUS EPISODE:
  Previous premise: "${continuation.previousStory}"
  Scene progression of previous episode:
${scenesSummary || 'Not provided.'}

  3. FINAL SCENE OF PREVIOUS EPISODE (THE IMMEDIATE HOOK / POINT OF CONNECTION):
  ${lastScene ? `Last Scene #${lastScene.sceneNumber}: "${lastScene.frenchSummary || ''}"\nPrompt: ${lastScene.videoPrompt}` : 'None'}

  4. MANDATORY CONTINUITY HOOK:
  Scene 1 of this NEW Episode ${continuation.episodeNumber} MUST BEGIN IMMEDIATELY after the final scene above.
  - If a character was running, looking at something, speaking, or entering a room, Scene 1 starts at that exact instant.
  - Maintain the atmosphere, geography, clothing, and tension from the cliffhanger.
  - Then progressively unfold the new events requested by the user below.
  ======================================================================
  `;
  }

  const prompt = `You are a master AI Cinema Director and Prompt Engineer for modern models (Midjourney v6/v7, Seedance 2.5, Kling 2.0). 
  Generate a complete production storyboard for a vertical video (9:16 aspect ratio).
  ${continuationInstructions}
  STORY CONTEXT / NEW EPISODE EVENTS: "${story}"
  TARGET VISUAL STYLE: "${style}"
  REQUIRED SCENES: Exactly ${sceneCount} scenes.
  TARGET SCENE DURATION: ${sceneDuration} seconds per scene.
  DIALOGUE & SUMMARY LANGUAGE: ${langLabel}.

  CRITICAL RULES:
  1. UNIFIED PROMPT MIDJOURNEY: Do NOT output separate positive and negative fields. Output ONE single copy-paste ready Midjourney prompt string ending with '--ar 9:16 --no [negative keywords]'.
     Format: [Character visualBlock], [Action], [Setting], [Look], [Camera/Lighting] --ar 9:16 --no blurry deformed text watermark mutilated

  2. UNIFIED ALL-IN-ONE VIDEO PROMPT (FOR SEEDANCE / MODERN VIDEO GENERATORS): 
     Do NOT output separate video prompt, narration, and audio prompts. The 'videoPrompt' MUST be ONE comprehensive prompt that includes everything needed for a ${sceneDuration}-second cinematic video with native audio:
     - Starts with the EXACT character 'visualBlock'
     - Chronological sequence of actions filling the ${sceneDuration}s. Use transition words like "starts by...", "then...", "ends with...". Include micro-expressions and body language.
     - Use professional set vocabulary (e.g., rack focus, dolly-in, chiaroscuro, three-point lighting). Avoid generic words like "cinematic".
     - Environmental secondary motion (fog swirling, rain falling, clothes moving)
     - Native Spoken Dialogue directly enclosed in double quotes. IMPORTANT: The spoken dialogue MUST be in ${langLabel} (e.g., ${langDialogueExample})
     - Native Ambient Audio & Sound Effects (e.g., [Audio: heavy rain falling on stone, low rumbling thunder, distant crow caw])
     - END the video prompt with negative specifications (e.g., "--no text, subtitles, watermark, distorted hands, morphing").

  3. SUBJECT/CHARACTER CONSISTENCY: Define the subject's 'visualBlock' once (approx 25 words). 
     - For humans, include distinctive clothing/facial features. 
     - For anthropomorphic trends (talking fruits, vegetables, animals), explicitly describe them as humanoid entities (e.g., 'An anthropomorphic broccoli character wearing a tiny denim jacket, with big expressive cartoon eyes and a wide smile'). 
     - For literal food/animals, describe texture, colors, species, or plating.
     This EXACT string MUST be pasted word-for-word at the very beginning of both the imagePrompt and videoPrompt of every scene where they appear. If continuing an existing episode, retain any existing characters and only define new ones if they appear for the first time.

  4. CINEMATIC FLOW & CONTINUITY: Ensure seamless transitions between scenes. Do not abruptly spawn subjects in static poses. Account for how the previous scene ended. Use dynamic entrances, exits, and camera reveals (e.g., 'Camera follows character walking into the dimly lit room...', 'Starts on a tight close-up of the door opening, panning right to reveal the ghost...', 'Subject walks into the frame from the left...'). Create a realistic, flowing narrative pace.

  Your output MUST be a strict JSON object following this exact structure:
  {
    "characters": [
      {
        "name": "Subject/Character Name",
        "description": "${langDescNote} of role or description of the object",
        "visualBlock": "English EXACT appearance block (~25 words, e.g., 'An anthropomorphic grumpy potato wearing a tiny leather jacket, with big cartoon eyes...' or 'A 45-year-old weary man...')",
        "imagePrompt": "English single prompt ready for Midjourney. IMPORTANT: For the casting shot, place the subject on a neutral, plain studio background to isolate their design, e.g., 'Character design sheet, neutral white background, studio lighting' or 'Product shot on clean neutral background' ending with --ar 9:16 --no ..."
      }
    ],
    "scenes": [
      {
        "sceneNumber": 1,
        "frenchSummary": "${langDescNote} de ce qui se passe dans la scène",
        "imagePrompt": "All-in-one English prompt for Midjourney including '--ar 9:16 --no ...'",
        "videoPrompt": "All-in-one English prompt for Seedance/Kling including the ${sceneDuration}s action progression, the spoken dialogue in ${langLabel} in quotes, and the ambient audio cues."
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: modelName || 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  try {
    const rawText = response.text || "{}";
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse storyboard", e);
    throw new Error("Failed to parse the generated storyboard.");
  }
}


/**
 * Convert a base64 data URL to a Blob
 */
function base64ToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binaryString = atob(parts[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Convert a Blob to a data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const VIDEO_MODELS = [
  { id: 'veo-3.1-generate-preview', label: 'Veo 3.1 Preview', supports4K: true },
  { id: 'veo-3.1-lite-generate-preview', label: 'Veo 3.1 Lite', supports4K: false },
  { id: 'veo-3.1-fast-generate-preview', label: 'Veo 3.1 Fast', supports4K: true },
];

/**
 * Generate a video clip from a scene image using Veo (image-to-video).
 * This is an async long-running operation that requires polling.
 */

export async function generateVideoForScene(
  apiKey: string,
  imageBase64: string,
  phrase: string,
  videoModel: string = 'veo-3.1-generate-preview',
  videoQuality: string = '1080p',
  onPollStatus?: (status: string) => void
): Promise<string> {
  const ai = getAI(apiKey);

  // 1. Prepare image data (strip base64 prefix)
  const base64Image = imageBase64.split(',')[1] || imageBase64;
  
  onPollStatus?.('Uploading image...');

  // 2. Start video generation (long-running operation)
  onPollStatus?.('Starting video generation...');
  
  let operation = await ai.models.generateVideos({
    model: videoModel,
    prompt: `Subtle cinematic movement, gentle atmospheric camera motion, slow-motion feel, dreamy ambiance. Animate this scene: "${phrase}"`,
    image: {
      imageBytes: base64Image,
      mimeType: 'image/jpeg',
    },
    config: {
      aspectRatio: '9:16',
      numberOfVideos: 1,
      resolution: videoQuality,
    },
  });

  // 3. Poll until completion (every 10 seconds)
  let pollCount = 0;
  const maxPolls = 60; // Max ~10 minutes
  
  while (!operation.done) {
    pollCount++;
    if (pollCount > maxPolls) {
      throw new Error("Video generation timed out after 10 minutes.");
    }
    
    onPollStatus?.(`Generating video... (${pollCount * 10}s)`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  // 4. Extract the generated video
  const generatedVideo = (operation as any).response?.generatedVideos?.[0];
  if (!generatedVideo?.video?.uri) {
    throw new Error("No video was generated by Veo.");
  }

  // 5. Download the video and convert to data URL
  onPollStatus?.('Downloading video...');
  
  const videoResponse = await fetch(generatedVideo.video.uri, {
    headers: {
      'x-goog-api-key': apiKey
    }
  });
  if (!videoResponse.ok) {
    throw new Error(`Failed to download generated video: ${videoResponse.status}`);
  }
  
  const videoBlob = await videoResponse.blob();
  return blobToDataUrl(videoBlob);
}

