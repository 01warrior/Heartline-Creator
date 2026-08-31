<div align="center">
  
  <br />

  # 🎬 Heartlines

  **The Open-Source AI Studio for Emotional & Aesthetic Short Vertical Videos**

  [![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.5%20%2F%203.6-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
  [![FFmpeg WASM](https://img.shields.io/badge/FFmpeg-WASM-0078D7?logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
  [![License](https://img.shields.io/badge/License-Apache--2.0-green.svg)](LICENSE)

  [Features](#-key-features) • [Security & Privacy](#-security--privacy) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## ✨ Overview

**Heartlines** is a modern, privacy-first web application designed to transform quotes, poetic themes, and emotional narratives into captivating short vertical videos (TikTok, Shorts, Reels).

Powered directly by **Google Gemini AI** and **FFmpeg WASM**, Heartlines orchestrates generative scriptwriting, 4K atmospheric imagery, and synthetic voiceovers—entirely inside your browser.

---

## 🚀 Key Features

- 📜 **Generative Poetic Scriptwriting**: Crafts touching, structured poems and narrative lines tailored to your emotional topic.
- 🎨 **4K Cinematic Visuals**: Generates high-res atmospheric background illustrations powered by Google Imagen 3.
- 🎙️ **Studio AI Voiceover**: Synthesizes natural, expressive audio narration with customizable voice tones (soft feminine, deep composed masculine).
- ⚡ **Client-Side Video Rendering**:
  - **Fast Export**: Instant browser canvas recording (WebM / MP4).
  - **HQ Export**: Full High-Definition client-side video compilation via **FFmpeg WASM**.
- 🔒 **100% Client-Side & Zero-Server Dependency**: Runs entirely in the browser. Your Gemini API key is stored locally in `localStorage`.
- 🌐 **Multilingual Support**: Fully internationalized in French (`fr`) and English (`en`).

---

## 🔒 Security & Privacy

Heartlines is built with privacy at its core:

1. **No External Backend**: There is no middleman server. The app communicates directly with Google's official AI APIs.
2. **Local Storage Only**: Your Gemini API key is saved exclusively in your browser's `localStorage`.
3. **Zero Tracking**: Your prompts, generated images, and exported videos remain entirely on your device.

---

## 🛠️ Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** / **pnpm**
- A **Google Gemini API Key** (Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/01warrior/Heartline-Creator.git
   cd Heartline-Creator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`, enter your Gemini API key in the studio prompt, and start creating!

---

## 🏗️ Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons, Hugeicons
- **AI Engines**: `@google/genai` (Gemini 2.5 / 3.6 Flash & Pro, Imagen 3, Google TTS)
- **Media Processing**: `@ffmpeg/ffmpeg`, `@ffmpeg/util`, Lottie React
- **Internationalization**: `i18next`, `react-i18next`

---

## 📂 Project Structure

```text
src/
├── assets/             # Static graphics and Lottie animations
├── components/         # React UI components (Workflow, Studio, Settings, Layout)
│   ├── layout/         # Studio sidebar navigation layout
│   └── workflow/       # Video creation pipeline components
├── services/           # Gemini AI API services & FFmpeg export handlers
├── i18n.ts             # Internationalization setup (FR / EN)
├── App.tsx             # Main router configuration & Studio routes
└── main.tsx            # Application entry point
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [Issues page](https://github.com/01warrior/Heartline-Creator/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **Apache-2.0** License. See `LICENSE` for more information.
