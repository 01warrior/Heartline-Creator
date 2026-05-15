import cinematicImg from '../../assets/cinematic.png';

export interface Scene {
  phrase: string;
  image?: string;
}

export const STYLE_PRESETS = [
  {
    id: 'stickman',
    label: 'Stickman Minimal',
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Ccircle cx='50' cy='25' r='10' stroke='black' stroke-width='4' fill='none'/%3E%3Cline x1='50' y1='35' x2='50' y2='70' stroke='black' stroke-width='4'/%3E%3Cline x1='50' y1='50' x2='30' y2='40' stroke='black' stroke-width='4'/%3E%3Cline x1='50' y1='50' x2='70' y2='40' stroke='black' stroke-width='4'/%3E%3Cline x1='50' y1='70' x2='35' y2='95' stroke='black' stroke-width='4'/%3E%3Cline x1='50' y1='70' x2='65' y2='95' stroke='black' stroke-width='4'/%3E%3C/svg%3E",
    prompt: `Stickman Base Design Prompt that matches the mood and theme of the story. This base prompt should include: Overall vibe (motivational, funny, stressed, calm, etc.) Character style (simple black stickman, rounded head, clean lines) Consistent features (expression style, line thickness, minimal design) White or minimal background style Format: Stickman Base Prompt: "Simple black stickman with a round head, clean smooth lines, minimalist style, expressive face, consistent proportions, modern flat illustration, minimal white background, soft emotional tone matching the story."`
  },
  {
    id: 'cinematic',
    label: 'Cinematic Noir',
    image: cinematicImg,
    prompt: 'cinematic soft noir, 35mm film grain, melancholic warm lighting, ultra-detailed textures, ethereal atmosphere'
  },
  {
    id: 'watercolor',
    label: 'Impasto Vertical',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    prompt: 'A vertical oil painting in a rich textured impasto style, with thick visible brushstrokes, layered paint, expressive texture, deep saturated colors, and a dramatic painterly surface. Strong sense of depth, tactile relief, and artistic movement. Powerful and atmospheric composition, vertically framed, abstract yet visually striking.'
  },
  {
    id: 'comic',
    label: 'Style Comics',
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=400&fit=crop',
    prompt: 'vibrant comic book style, bold ink lines, halftone patterns, dynamic composition, saturated colors, classic superhero aesthetic, high contrast, expressive action'
  }
];
