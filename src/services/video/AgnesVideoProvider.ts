import { IVideoProvider, VideoGenerationParams, VideoTaskResult } from './types';

const AGNES_BASE_URL = 'https://apihub.agnes-ai.com';

export class AgnesVideoProvider implements IVideoProvider {
  name = 'Agnes Video v2.0';

  /**
   * Crée une tâche de génération vidéo auprès de l'API Agnes
   */
  async createTask(params: VideoGenerationParams, apiKey: string): Promise<string> {
    if (!apiKey?.trim()) {
      throw new Error("Clé API Agnes manquante. Veuillez configurer votre clé API Agnes dans les paramètres.");
    }

    // Dimensions en fonction de l'aspect ratio (par défaut 9:16 pour les formats Shorts / Reels)
    let width = 768;
    let height = 1152;
    if (params.aspectRatio === '16:9') {
      width = 1152;
      height = 768;
    } else if (params.aspectRatio === '1:1') {
      width = 1024;
      height = 1024;
    }

    const payload: Record<string, any> = {
      model: params.model || 'agnes-video-v2.0',
      prompt: params.prompt || 'Cinematic realistic motion, smooth high definition visual continuity',
      width,
      height,
      num_frames: 121,
      frame_rate: 24,
    };

    if (params.imageUrl) {
      payload.image_url = params.imageUrl;
    }

    const response = await fetch(`${AGNES_BASE_URL}/v1/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Erreur API Agnes HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        errorMessage = errJson.message || errJson.error || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const videoId = data.video_id || data.task_id || data.id;

    if (!videoId) {
      throw new Error("L'API Agnes n'a pas retourné d'identifiant vidéo (video_id ou task_id).");
    }

    return String(videoId);
  }

  /**
   * Vérifie le statut d'une tâche de génération vidéo
   */
  async checkStatus(taskId: string, apiKey: string): Promise<VideoTaskResult> {
    if (!apiKey?.trim()) {
      throw new Error("Clé API Agnes manquante.");
    }

    // 1. Essai sur l'endpoint principal /agnesapi?video_id=...
    try {
      const response = await fetch(`${AGNES_BASE_URL}/agnesapi?video_id=${encodeURIComponent(taskId)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return this.parseTaskResponse(data);
      }
    } catch (e) {
      console.warn("Échec requête /agnesapi, bascule sur endpoint de fallback:", e);
    }

    // 2. Fallback sur /v1/videos/<id>
    const fallbackResponse = await fetch(`${AGNES_BASE_URL}/v1/videos/${encodeURIComponent(taskId)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
    });

    if (!fallbackResponse.ok) {
      let errText = `Erreur vérification statut Agnes (${fallbackResponse.status})`;
      try {
        const errJson = await fallbackResponse.json();
        errText = errJson.message || errJson.error || errText;
      } catch {
        // use fallback
      }
      return {
        status: 'failed',
        error: errText,
      };
    }

    const fallbackData = await fallbackResponse.json();
    return this.parseTaskResponse(fallbackData);
  }

  private parseTaskResponse(data: any): VideoTaskResult {
    const rawStatus = (data.status || data.state || '').toLowerCase();
    
    // Extraction de l'URL finale de la vidéo
    const videoUrl = data.metadata?.url || data.video_url || data.url || data.output?.url || data.result?.url;

    if (rawStatus === 'completed' || rawStatus === 'succeeded' || rawStatus === 'success' || (videoUrl && !rawStatus.includes('fail'))) {
      return {
        status: 'completed',
        videoUrl,
        progress: 100,
      };
    }

    if (rawStatus === 'failed' || rawStatus === 'error') {
      return {
        status: 'failed',
        error: data.error || data.message || "La génération vidéo a échoué chez Agnes.",
      };
    }

    if (rawStatus === 'processing' || rawStatus === 'running') {
      return {
        status: 'processing',
        progress: typeof data.progress === 'number' ? data.progress : 50,
      };
    }

    return {
      status: 'pending',
      progress: typeof data.progress === 'number' ? data.progress : 15,
    };
  }

  /**
   * Cycle complet : Création -> Polling -> Retour de l'URL vidéo
   */
  async generateVideo(params: VideoGenerationParams, apiKey: string): Promise<string> {
    params.onProgress?.("Initialisation de la tâche Agnes Video...");
    const videoId = await this.createTask(params, apiKey);

    params.onProgress?.("Génération vidéo en cours avec Agnes Video v2.0...");
    
    const maxPolls = 120; // 120 x 5s = 10 minutes maximum
    let attempts = 0;

    while (attempts < maxPolls) {
      attempts++;
      await new Promise(res => setTimeout(res, 5000));

      const elapsedSeconds = attempts * 5;
      params.onProgress?.(`Génération en cours... (~${elapsedSeconds}s)`);

      const result = await this.checkStatus(videoId, apiKey);

      if (result.status === 'completed' && result.videoUrl) {
        params.onProgress?.("Téléchargement de la vidéo finale...");
        return result.videoUrl;
      }

      if (result.status === 'failed') {
        throw new Error(result.error || "La génération vidéo a échoué sur l'API Agnes.");
      }
    }

    throw new Error("Délai d'attente dépassé (10 minutes) lors de la génération avec Agnes Video.");
  }
}
