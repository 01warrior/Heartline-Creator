import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { saveAs } from 'file-saver';

export async function exportVideoFast(
  scenes: { phrase: string; image?: string }[],
  wavUrl: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[MediaRecorder] Starting fast export...');
      const audio = new Audio();
      // Remove crossOrigin for blob URLs to avoid CORS logic that causes 404
      if (!wavUrl.startsWith('blob:') && !wavUrl.startsWith('data:')) {
        audio.crossOrigin = 'anonymous';
      }

      await new Promise<void>((res, rej) => {
        audio.onloadedmetadata = () => res();
        audio.onerror = (e) => {
           console.error('[MediaRecorder] Audio error:', e);
           rej(new Error('Failed to load audio for export'));
        };
        audio.src = wavUrl;
      });

      const audioDuration = audio.duration;
      const validScenes = scenes.filter(s => !!s.image);
      if (validScenes.length === 0) throw new Error('Aucune image à exporter');

      const durationPerScene = audioDuration / validScenes.length;

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d', { alpha: false })!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const loadedImages = await Promise.all(validScenes.map(async scene => {
         const img = new Image();
         if (!scene.image!.startsWith('blob:') && !scene.image!.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
         }
         await new Promise((r, j) => {
            img.onload = r;
            img.onerror = j;
            img.src = scene.image!;
         });
         return img;
      }));

      const stream = canvas.captureStream(60);
      let audioStream: MediaStream | null = null;
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(audio);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        audioStream = dest.stream;
      } catch (e) {
        console.warn('Could not capture audio stream', e);
      }

      if (audioStream && audioStream.getAudioTracks().length > 0) {
        stream.addTrack(audioStream.getAudioTracks()[0]);
      }

      const chunks: BlobPart[] = [];
      const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm;codecs=vp9,opus';
      const recorder = new MediaRecorder(stream, { 
        mimeType, 
        videoBitsPerSecond: 20000000 // 20 Mbps for high quality
      });

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };
      recorder.onerror = (e) => {
         console.error('Failed to export video via MediaRecorder', e);
         reject(e);
      };

      let exportFinished = false;
      
      const renderFrame = () => {
        if (exportFinished) return;

        // Master clock is the audio position
        const elapsed = audio.currentTime;
        
        // Force rendering at least the first frame even if audio hasn't started
        // Also check for end of audio (with a small safety buffer)
        if (audio.ended || (elapsed >= audioDuration - 0.05 && elapsed > 0)) {
          console.log('[MediaRecorder] Export reached end of audio.');
          exportFinished = true;
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
          audio.pause();
          return;
        }

        const targetSceneIndex = Math.min(Math.max(0, Math.floor(elapsed / durationPerScene)), loadedImages.length - 1);
        const sceneProgress = (elapsed % durationPerScene) / durationPerScene;
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const img = loadedImages[targetSceneIndex];
        const scene = validScenes[targetSceneIndex];
        
        // Image Animation (Smooth Zoom)
        const baseScale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const currentScale = baseScale * (1 + sceneProgress * 0.12); // Slightly more zoom for visual feedback
        
        const scaledWidth = img.width * currentScale;
        const scaledHeight = img.height * currentScale;
        const x = (canvas.width / 2) - (scaledWidth / 2);
        const y = (canvas.height / 2) - (scaledHeight / 2);
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Subtitles Overlay
        const sceneElapsed = elapsed % durationPerScene;
        const gradientAlpha = Math.min(1, sceneElapsed / 0.5);
        ctx.save();
        ctx.globalAlpha = gradientAlpha;
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
        ctx.restore();

        // 2. Draw Text (Fade In + Slide Up)
        ctx.save();
        const textFadeIn = Math.min(1, sceneElapsed / 0.6); // 0.6s fade for elegance
        const slideUp = (1 - Math.pow(1 - textFadeIn, 3)); // Cubic ease out
        const yOffset = (1 - slideUp) * 40; // 40px slide

        ctx.globalAlpha = textFadeIn;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.font = 'bold 72px Inter, system-ui, sans-serif'; 
        
        const padding = 100;
        const maxWidth = canvas.width - (padding * 2);
        const words = scene.phrase.split(' ');
        let line = '';
        const lines = [];
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const lineHeight = 100;
        let currentY = canvas.height - 240 + yOffset; 
        
        for (let i = lines.length - 1; i >= 0; i--) {
          ctx.fillText(lines[i].trim(), padding, currentY);
          currentY -= lineHeight;
        }
        ctx.restore();
        
        onProgress?.((elapsed / audioDuration) * 100);
        requestAnimationFrame(renderFrame);
      };

      // Start recording and audio playback
      recorder.start();
      audio.play().catch(e => {
        console.error('Audio play failed:', e);
        reject(e);
      });
      
      requestAnimationFrame(renderFrame);
    } catch (e) {
      reject(e);
    }
  });
}

export async function exportVideo(
  scenes: { phrase: string; image?: string }[],
  wavUrl: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {

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
  
  return blob;
}
