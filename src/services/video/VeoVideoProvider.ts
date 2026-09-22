import { IVideoProvider, VideoGenerationParams, VideoTaskResult } from './types';
import { generateVideoForScene } from '../gemini';

export class VeoVideoProvider implements IVideoProvider {
  name = 'Google Veo (3.1)';

  async createTask(_params: VideoGenerationParams, _apiKey: string): Promise<string> {
    // Veo utilise un workflow opéré par le SDK Gemini
    return 'veo_task_' + Date.now();
  }

  async checkStatus(_taskId: string, _apiKey: string): Promise<VideoTaskResult> {
    return {
      status: 'completed',
    };
  }

  async generateVideo(params: VideoGenerationParams, apiKey: string): Promise<string> {
    if (!apiKey?.trim()) {
      throw new Error("Clé API Gemini manquante.");
    }
    if (!params.imageUrl) {
      throw new Error("Une image source est requise pour générer une animation vidéo avec Veo.");
    }

    return generateVideoForScene(
      apiKey,
      params.imageUrl,
      params.prompt,
      params.model || 'veo-3.1-lite-generate-preview',
      params.quality || '720p',
      params.onProgress
    );
  }
}
