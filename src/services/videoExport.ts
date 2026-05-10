import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function exportVideo(
  scenes: { phrase: string; image?: string }[],
  wavUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    if (onProgress) onProgress(progress * 100);
  });

  // Load ffmpeg-core via unpkg
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  // Get duration of audio
  const audioDuration = await new Promise<number>((resolve, reject) => {
    const audio = new Audio(wavUrl);
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = reject;
  });

  // Write WAV file
  await ffmpeg.writeFile('audio.wav', await fetchFile(wavUrl));

  // Determine duration for each scene
  const numScenes = scenes.length;
  const durationPerScene = audioDuration / numScenes;

  // Write images
  let concatList = '';
  for (let i = 0; i < numScenes; i++) {
    const scene = scenes[i];
    if (!scene.image) continue;
    
    // Convert base64 to buffer
    const base64Data = scene.image.split(',')[1];
    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let j = 0; j < len; j++) {
      bytes[j] = binaryStr.charCodeAt(j);
    }
    
    const fileName = `img${i}.jpg`;
    await ffmpeg.writeFile(fileName, bytes);
    
    concatList += `file '${fileName}'\n`;
    concatList += `duration ${durationPerScene.toFixed(3)}\n`;
  }
  
  // Last frame has no duration so ffmpeg might hold it
  if (numScenes > 0) {
    concatList += `file 'img${numScenes - 1}.jpg'\n`;
  }

  await ffmpeg.writeFile('list.txt', concatList);

  // Run FFmpeg command
  // 1080p width at least, fit in. Let's do scale and crop or just 1080:1920 (TikTok format for vertical)
  // Let's use standard vertical shorts format: crop/scale to 1080x1920
  await ffmpeg.exec([
    '-f', 'concat', 
    '-safe', '0', 
    '-i', 'list.txt',
    '-i', 'audio.wav',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-r', '30', // Framerate
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920', // Ensure nice vertical
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest', // Ensure video stops when shortest audio/video stream ends
    'output.mp4'
  ]);

  const outputData = await ffmpeg.readFile('output.mp4');
  
  const videoBlob = new Blob([outputData], { type: 'video/mp4' });
  saveAs(videoBlob, 'heartlines-production.mp4');
}
