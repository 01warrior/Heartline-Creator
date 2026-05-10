import { saveAs } from 'file-saver';

export async function exportVideo(
  scenes: { phrase: string; image?: string }[],
  wavUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      if (onProgress) onProgress(5);
      
      const audio = new Audio(wavUrl);
      await new Promise((res) => {
        audio.oncanplaythrough = res;
        audio.load();
      });

      const audioDuration = audio.duration;
      const width = 1080;
      const height = 1920;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Load all images first
      if (onProgress) onProgress(10);
      const loadedImages = await Promise.all(
        scenes.map(async (scene) => {
          if (!scene.image) return null;
          return new Promise<HTMLImageElement | null>((res) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = () => res(null);
            img.src = scene.image!;
          });
        })
      );
      if (onProgress) onProgress(20);

      // Setup streams
      const canvasStream = canvas.captureStream(30); // 30 FPS
      
      // We need to capture the audio from the element
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audio);
      const dest = audioContext.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioContext.destination); // Also play to speakers so we can hear progress?
      
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const formats = [
        'video/mp4;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      const mimeType = formats.find(f => MediaRecorder.isTypeSupported(f)) || 'video/webm';
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8Mbps for high quality
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `heartlines-production.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      };

      recorder.onerror = (e) => reject(e);

      // Animation Loop
      const numScenes = scenes.length;
      const durationPerScene = audioDuration / numScenes;

      const draw = () => {
        const currentTime = audio.currentTime;
        const progress = (currentTime / audioDuration) * 100;
        if (onProgress) onProgress(20 + (progress * 0.8));

        const sceneIndex = Math.min(
          Math.floor(currentTime / durationPerScene),
          numScenes - 1
        );

        const img = loadedImages[sceneIndex];

        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        if (img) {
          // Scale and crop (Cover)
          const scale = Math.max(width / img.width, height / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (width - w) / 2;
          const y = (height - h) / 2;
          ctx.drawImage(img, x, y, w, h);
        }

        if (currentTime < audioDuration && !audio.paused) {
          requestAnimationFrame(draw);
        }
      };

      // Start recording
      recorder.start();
      await audio.play();
      draw();

      audio.onended = () => {
        recorder.stop();
        audioContext.close();
      };

    } catch (err) {
      reject(err);
    }
  });
}
