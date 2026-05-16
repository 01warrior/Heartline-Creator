// Cost calculation utility based on standard Google GenAI pricing

// Prices per 1M tokens
const TEXT_MODELS = {
  'gemini-3.1-flash-lite': { in: 0.25, out: 1.50 },
  'gemini-3-flash-preview': { in: 0.50, out: 3.00 },
  'gemini-3.1-pro-preview': { in: 2.00, out: 12.00 },
  'gemini-2.5-flash-preview': { in: 0.10, out: 0.40 },
};

// Prices per Image
const IMAGE_MODELS = {
  'gemini-3.1-flash-image-preview': 0.045,
  'gemini-2.5-flash-image': 0.039,
};

// Prices per Scene (Approximate based on character count for TTS)
// Input text + Output audio cost
const TTS_MODELS = {
  'gemini-3.1-flash-tts-preview': 0.002, 
  'gemini-3.1-pro-tts-preview': 0.002,
  'gemini-2.5-flash-tts-preview': 0.001,
  'gemini-2.5-pro-tts-preview': 0.002,
};

// Prices per Second of video
const VIDEO_MODELS = {
  'veo-3.1-generate-preview': { '720p': 0.40, '1080p': 0.40, '4k': 0.60, default: 0.40 },
  'veo-3.1-fast-generate-preview': { '720p': 0.10, '1080p': 0.12, '4k': 0.30, default: 0.12 },
  'veo-3.1-lite-generate-preview': { '720p': 0.05, '1080p': 0.08, '4k': 0.08, default: 0.08 }
};

/**
 * Estimate the cost of generating a poem script
 */
export function estimatePoemCost(modelId: string, minScenes: number, maxScenes: number): number {
  const modelPricing = TEXT_MODELS[modelId as keyof typeof TEXT_MODELS] || TEXT_MODELS['gemini-3-flash-preview'];
  
  // Rough estimate: 200 input tokens (prompt), ~50 tokens output per scene
  const inputTokens = 200;
  const expectedScenes = (minScenes + maxScenes) / 2;
  const outputTokens = expectedScenes * 50;

  const cost = (inputTokens / 1000000) * modelPricing.in + (outputTokens / 1000000) * modelPricing.out;
  return cost;
}

/**
 * Estimate the cost of generating media (images, audio, video) for a set number of scenes
 */
export function estimateMediaCost(
  scenesCount: number,
  imageModelId: string,
  ttsModelId: string,
  videoModelId: string,
  videoQuality: string,
  animateVideo: boolean
): number {
  let totalCost = 0;

  // 1. Image Cost
  const imgCost = IMAGE_MODELS[imageModelId as keyof typeof IMAGE_MODELS] || 0.045;
  totalCost += imgCost * scenesCount;

  // 2. TTS Cost
  const ttsCost = TTS_MODELS[ttsModelId as keyof typeof TTS_MODELS] || 0.002;
  totalCost += ttsCost * scenesCount;

  // 3. Video Cost
  if (animateVideo) {
    const videoPricing = VIDEO_MODELS[videoModelId as keyof typeof VIDEO_MODELS] || VIDEO_MODELS['veo-3.1-generate-preview'];
    // Default video length is 8 seconds per scene for Veo
    const durationPerScene = 8;
    const pricePerSecond = videoPricing[videoQuality.toLowerCase() as keyof typeof videoPricing] || videoPricing.default;
    
    totalCost += pricePerSecond * durationPerScene * scenesCount;
  }

  return totalCost;
}

/**
 * Format cost to a readable string (e.g., "~$0.12")
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '0.00$';
  if (cost < 0.001) {
    return "< 0.001$";
  }
  if (cost < 0.01) {
    return `~${cost.toFixed(3)}$`;
  }
  return `~${cost.toFixed(2)}$`;
}

/**
 * Calculate the exact final cost after generation
 */
export function calculateActualCost(
  textModelId: string,
  inputChars: number,
  outputChars: number,
  imageModelId: string,
  imageCount: number,
  ttsModelId: string,
  audioDurationSeconds: number,
  videoModelId: string,
  videoQuality: string,
  videoDurationSeconds: number
): number {
  let total = 0;
  
  // Approximation chars -> tokens (4 chars ≈ 1 token)
  const inputTokens = inputChars / 4;
  const outputTokens = outputChars / 4;
  
  const textPricing = TEXT_MODELS[textModelId as keyof typeof TEXT_MODELS] || TEXT_MODELS['gemini-3-flash-preview'];
  total += (inputTokens / 1000000) * textPricing.in + (outputTokens / 1000000) * textPricing.out;

  const imgCost = IMAGE_MODELS[imageModelId as keyof typeof IMAGE_MODELS] || 0.045;
  total += imgCost * imageCount;

  const ttsCostPerScene = TTS_MODELS[ttsModelId as keyof typeof TTS_MODELS] || 0.002;
  // Estimate scene count from audio duration (avg 6s per scene)
  const estimatedScenes = Math.ceil(audioDurationSeconds / 6);
  total += ttsCostPerScene * estimatedScenes;

  if (videoDurationSeconds > 0) {
    const videoPricing = VIDEO_MODELS[videoModelId as keyof typeof VIDEO_MODELS] || VIDEO_MODELS['veo-3.1-generate-preview'];
    const pricePerSecond = videoPricing[videoQuality.toLowerCase() as keyof typeof videoPricing] || videoPricing.default;
    total += pricePerSecond * videoDurationSeconds;
  }

  return total;
}
