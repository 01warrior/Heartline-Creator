import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { saveAs } from 'file-saver';

export async function exportVideo(
  scenes: { phrase: string; image?: string }[],
  wavUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {

  // 1. INIT FFMPEG single-thread (fichiers locaux, pas de CORS)
  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message));
  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(Math.round(progress * 100));
  });

  const baseURL = window.location.origin;
  const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
  const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
  
  console.log('[FFmpeg] Attempting to load from:', { coreURL, wasmURL });

  try {
    await ffmpeg.load({
      coreURL,
      wasmURL,
    });
    console.log('[FFmpeg] Successfully loaded');
  } catch (err) {
    console.error('[FFmpeg] Failed to load core:', err);
    throw err;
  }

  // 2. AUDIO
  const audioDuration = await new Promise<number>((resolve, reject) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = () => reject(new Error('Impossible de charger le fichier audio'));
    audio.src = wavUrl;
  });

  await ffmpeg.writeFile('audio.wav', await fetchFile(wavUrl));

  // 3. IMAGES + liste concat
  const validScenes = scenes.filter(s => !!s.image);
  if (validScenes.length === 0) throw new Error('Aucune image à exporter');

  const durationPerScene = audioDuration / validScenes.length;
  let concatList = '';

  for (let i = 0; i < validScenes.length; i++) {
    const base64 = validScenes[i].image!.split(',')[1];
    const binary = atob(base64);
    const bytes  = new Uint8Array(binary.length);
    for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);

    const fileName = `img${i}.jpg`;
    await ffmpeg.writeFile(fileName, bytes);
    concatList += `file '${fileName}'\nduration ${durationPerScene.toFixed(3)}\n`;
  }

  // Répéter la dernière image (requis par FFmpeg pour fermer le concat)
  concatList += `file 'img${validScenes.length - 1}.jpg'\n`;
  await ffmpeg.writeFile('list.txt', new TextEncoder().encode(concatList));

  // 4. ENCODAGE
  await ffmpeg.exec([
    '-f',        'concat',
    '-safe',     '0',
    '-i',        'list.txt',
    '-i',        'audio.wav',
    '-c:v',      'libx264',
    '-preset',   'fast',
    '-crf',      '20',
    '-r',        '30',
    '-pix_fmt',  'yuv420p',
    '-vf',       'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
    '-c:a',      'aac',
    '-b:a',      '192k',
    '-map',      '0:v:0',
    '-map',      '1:a:0',
    '-shortest',
    '-movflags', '+faststart',
    'output.mp4',
  ]);

  // 5. EXPORT
  const data = await ffmpeg.readFile('output.mp4');
  const blob = new Blob(
    [data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer)],
    { type: 'video/mp4' }
  );

  saveAs(blob, 'video-production.mp4');
}
