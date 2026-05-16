import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { saveAs } from 'file-saver';

export async function exportVideoFast(
  scenes: { phrase: string; image?: string; video?: string }[],
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
      const validScenes = scenes.filter(s => !!s.image || !!s.video);
      if (validScenes.length === 0) throw new Error('Aucune image à exporter');

      // PRE-CALCULATE SCENE DURATIONS
      // We want each scene to be at least as long as its narration part, 
      // but also at least as long as the generated video (e.g. 8s) to not "lose" footage.
      const baseNarrationDuration = audioDuration / validScenes.length;
      
      const sceneDurations = validScenes.map(() => {
        // We use 8s as a safe default for Veo videos if metadata isn't fully loaded
        return Math.max(baseNarrationDuration, 8); 
      });

      const totalVideoDuration = sceneDurations.reduce((a, b) => a + b, 0);
      const sceneStarts = [0];
      for (let i = 0; i < sceneDurations.length - 1; i++) {
        sceneStarts.push(sceneStarts[i] + sceneDurations[i]);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d', { alpha: false })!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Load images AND videos for each scene
      const loadedMedia: { img: HTMLImageElement; vid: HTMLVideoElement | null }[] = await Promise.all(
        validScenes.map(async scene => {
          // Load fallback image
          const img = new Image();
          if (scene.image && !scene.image.startsWith('blob:') && !scene.image.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
          }
          if (scene.image) {
            await new Promise((r, j) => {
              img.onload = r;
              img.onerror = j;
              img.src = scene.image!;
            });
          }

          // Load video if available
          let vid: HTMLVideoElement | null = null;
          if (scene.video) {
            vid = document.createElement('video');
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
            await new Promise<void>((r, j) => {
              vid!.onloadeddata = () => r();
              vid!.onerror = () => j(new Error('Failed to load scene video'));
              vid!.src = scene.video!;
            });
            vid.play().catch(() => {});
          }

          return { img, vid };
        })
      );

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
      recorder.onstart = () => {
        console.log('[MediaRecorder] Recording started.');
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
      let lastProgressUpdate = 0;
      let startTimeRef = 0;
      
      const renderFrame = () => {
        if (exportFinished) return;

        // Use an internal clock that can exceed audio duration
        // We still use audio as a base, but if audio ends and video is longer, we keep going
        const elapsed = (performance.now() - startTimeRef) / 1000 * (audio.playbackRate || 1);
        
        // Update progress based on totalVideoDuration
        if (onProgress) {
          const currentProgress = Math.min((elapsed / totalVideoDuration) * 100, 100);
          if (currentProgress - lastProgressUpdate > 0.5) {
            onProgress(currentProgress);
            lastProgressUpdate = currentProgress;
          }
        }

        // Final transition check
        if (elapsed >= totalVideoDuration - 0.05) {
          console.log('[MediaRecorder] Export reached end of total duration.');
          exportFinished = true;
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
          audio.pause();
          return;
        }

        // Determine which scene we are in
        let targetSceneIndex = 0;
        for (let i = sceneStarts.length - 1; i >= 0; i--) {
          if (elapsed >= sceneStarts[i]) {
            targetSceneIndex = i;
            break;
          }
        }

        const sceneElapsed = elapsed - sceneStarts[targetSceneIndex];
        const currentSceneDuration = sceneDurations[targetSceneIndex];
        const sceneProgress = Math.min(sceneElapsed / currentSceneDuration, 1);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const media = loadedMedia[targetSceneIndex];
        const scene = validScenes[targetSceneIndex];
        
        // Use video frame if available, otherwise use image with zoom
        if (media.vid && media.vid.readyState >= 2) {
          const vidDuration = media.vid.duration || 8;
          
          // ADAPTIVE SPEED (Possibilité 2)
          // If scene is longer than video, we slow down the video (down to 0.5x speed)
          // Otherwise we loop.
          let playbackRate = 1;
          if (currentSceneDuration > vidDuration) {
             playbackRate = Math.max(0.5, vidDuration / currentSceneDuration);
          }
          
          // Sync video time with scene progress and playback rate
          // If we are slower than 0.5x, the modulo will handle the loop
          const targetVidTime = (sceneElapsed * playbackRate) % vidDuration;
          
          media.vid.currentTime = targetVidTime;

          // Draw video frame — cover the canvas
          const vw = media.vid.videoWidth || canvas.width;
          const vh = media.vid.videoHeight || canvas.height;
          const vidScale = Math.max(canvas.width / vw, canvas.height / vh);
          const sw = vw * vidScale;
          const sh = vh * vidScale;
          ctx.drawImage(media.vid, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh);
        } else {
          // Fallback: Image Animation (Smooth Zoom)
          const img = media.img;
          const baseScale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const currentScale = baseScale * (1 + sceneProgress * 0.12);
          const scaledWidth = img.width * currentScale;
          const scaledHeight = img.height * currentScale;
          const x = (canvas.width / 2) - (scaledWidth / 2);
          const y = (canvas.height / 2) - (scaledHeight / 2);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        }

        // Subtitles Overlay
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
        const textFadeIn = Math.min(1, sceneElapsed / 0.6);
        const slideUp = (1 - Math.pow(1 - textFadeIn, 3));
        const yOffset = (1 - slideUp) * 40;

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
        
        // Throttled progress update to save CPU for the encoder
        const now = performance.now();
        if (now - lastProgressUpdate > 200) {
          onProgress?.((elapsed / totalVideoDuration) * 100);
          lastProgressUpdate = now;
        }
        
        requestAnimationFrame(renderFrame);
      };

      // Start recording with a timeslice to flush data regularly
      recorder.start(1000);
      startTimeRef = performance.now();
      lastProgressUpdate = performance.now();
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
  scenes: { phrase: string; image?: string; video?: string }[],
  wavUrl: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {

  // 1. INIT FFMPEG single-thread (fichiers locaux, pas de CORS)
  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message));
  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(Math.round(progress * 100));
  });

  // Use public paths directly without toBlobURL conversion to avoid CORS issues
  const coreURL = '/ffmpeg-core.js';
  const wasmURL = '/ffmpeg-core.wasm';
  
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
  const uint8Data = data instanceof Uint8Array ? new Uint8Array(data) : new Uint8Array(data as unknown as ArrayBuffer);
  const blob = new Blob([uint8Data], { type: 'video/mp4' });
  
  return blob;
}
