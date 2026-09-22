export interface VideoGenerationParams {
  prompt: string;
  imageUrl?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  durationSeconds?: number;
  model?: string;
  quality?: string;
  onProgress?: (status: string) => void;
}

export interface VideoTaskResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  progress?: number;
}

export interface IVideoProvider {
  name: string;
  createTask(params: VideoGenerationParams, apiKey: string): Promise<string>;
  checkStatus(taskId: string, apiKey: string): Promise<VideoTaskResult>;
  generateVideo(params: VideoGenerationParams, apiKey: string): Promise<string>;
}

export type VideoProviderType = 'veo' | 'agnes';
