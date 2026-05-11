import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        studio: 'Studio',
      },
      hero: {
        creatorsInfo: 'Over <1>{{count}} creators</1> use Heartlines',
        title: 'Put your words <br /> into images',
        subtitle: 'The first creative studio designed for emotional short vertical stories. Generate unique visuals and narrations from your quotes or poems with AI.',
        getStarted: 'Join the Studio',
      },
      features: {
        f1Title: 'Generative Poetry',
        f1Desc: 'Advanced language algorithms write touching and structured poems based on the theme you choose.',
        f2Title: 'Cinematic Visuals',
        f2Desc: 'Generate high-quality 4K atmospheric illustrations that match every line of your narrative.',
        f3Title: 'Immersive Voice',
        f3Desc: 'Bring your creations to life with premium synthetic voices, with pace and emotion tailored to enhance your message.'
      },
      testimonials: {
        title: 'Creator Testimonials',
        subtitle: 'They boosted their productivity with Heartlines.',
        quotes: [
          { name: '@AlexStudio', platform: 'YouTube', text: 'The visual quality is insane, perfect for my intros.' },
          { name: '@LinaContent', platform: 'TikTok', text: 'Saved 3h of editing on my Reels every week!' },
          { name: '@MarkDigital', platform: 'Facebook', text: 'My stories have never had so much engagement.' },
          { name: '@CreativeFlow', platform: 'YouTube', text: 'The AI that finally understands the emotion I want to convey.' },
          { name: '@SarahVlog', platform: 'TikTok', text: 'A phenomenal time saver for my narrations.' },
          { name: '@JulienEdits', platform: 'YouTube', text: 'I will never go back, the studio is intuitive.' },
          { name: '@EmmaTikTok', platform: 'TikTok', text: 'No more writer\'s block for my scripts!' },
          { name: '@SocialQueen', platform: 'Facebook', text: 'A unique aesthetic that sets me apart from the competition.' },
          { name: '@VideoMaster', platform: 'YouTube', text: 'The 4K export is incredibly clean.' },
          { name: '@TechReview', platform: 'TikTok', text: 'The voice synthesis is the most natural I\'ve tested.' }
        ]
      },
      footer: {
        rights: '© 2024 - 2026 Heartlines. All rights reserved.'
      },
      apiKey: {
        title: 'Welcome to Heartlines',
        description: 'Aesthetic video generator. Please enter your Gemini API Key. It will be stored locally in your browser.',
        label: 'Gemini API Key',
        placeholder: 'AIzaSy...',
        submit: 'Start Editing'
      },
      studio: {
        editorTitle: 'Heartlines',
        editorBadge: 'Editor',
        editorSubtitle: 'Set your topic and visual style, then craft your emotional story.',
        topicLabel: 'Topic / Feeling',
        topicPlaceholder: 'e.g. You Inside Me, finding love again...',
        styleLabel: 'Visual Style Settings',
        stylePlaceholder: 'e.g. cinematic soft noir, 35mm film grain, warm melancholic lighting...',
        styleTip: 'Tip: Describe colors (teal and orange), lighting (golden hour), and camera (35mm lens) for best consistency.',
        btnGenerateScript: 'Generate Script',
        btnWritingLines: 'Writing lines...',
        reviewTitle: 'Review Sequence',
        btnStartProduction: 'Start Production',
        btnRemoveKey: 'Remove API Key',
        previewMode: 'Preview Mode',
        library: 'Library',
        settings: 'Settings',
        masterpieceWait: 'Your masterpiece awaits...',
        craftingExperience: 'Crafting the experience...',
        generatingDescription: 'Generating 4K moody images and rendering high-fidelity AI audio streams.',
        complete: 'complete',
        settingsTitle: 'Settings',
        btnSaveConfig: 'Save Configuration',
        aiSuggestions: 'AI Suggestions',
        themePick: 'Pick a theme for your next masterpiece',
        btnMoreIdeas: 'Generate more ideas',
        howToSolve: 'How to solve this?',
        solve1: 'Wait 60 seconds before trying again (Free Tier limits).',
        solve2: 'Try a different model (Flash models are faster but have stricter limits).',
        solve3: 'Open the **Library** to download assets already generated!',
        btnUnderstood: 'Understood',
        mediaLibrary: 'Media Library',
        librarySubtitle: 'All assets generated for this production',
        btnFastExport: 'Fast Export',
        btnHqExport: 'HQ (FFmpeg)',
        btnDownloadAll: 'Download All (ZIP)',
        fastExportTitle: 'Fast export using browser recording (WebM/MP4)',
        hqExportTitle: 'High Quality export using FFmpeg (MP4) - Slower',
        labels: {
          scriptModel: 'Script Generation Model',
          imageModel: 'Visual Model (Image)',
          ttsModel: 'Voice Model (TTS)',
          voiceTone: 'AI Voice (Tone)',
          femSoft: 'Feminine - Soft & Melodic',
          maleDeep: 'Masculine - Deep & Composed',
          flashLiteDesc: 'Ultra-fast speed - Ideal for instant drafts.',
          flashDesc: 'Balanced Performance - The recommended standard choice.',
          proDesc: 'Advanced Intelligence - Complex poetry and deep nuances.',
          legacyDesc: 'Legacy Model - Stable and proven.',
          nanoDesc: 'Nano Banana - Abstract styles and fast generations.',
          highResDesc: 'High Quality - Photorealistic textures and depth.',
          ttsFlashDesc: 'Recommended - Natural and expressive voices.',
          ttsProDesc: 'Studio Quality - Crystal clear clarity.'
        }
      }
    }
  },
  fr: {
    translation: {
      nav: {
        studio: 'Studio',
      },
      hero: {
        creatorsInfo: 'Plus de <1>{{count}} créateurs</1> utilisent Heartlines',
        title: 'Mettez vos mots <br /> en images',
        subtitle: 'Le premier studio de création conçu pour les histoires courtes verticales émotionnelles. Générez des visuels et des narrations uniques à partir de vos citations ou poèmes avec l\'IA.',
        getStarted: 'Rejoindre le Studio',
      },
      features: {
        f1Title: 'Poésie Générative',
        f1Desc: 'Des algorithmes de langage avancés rédigent des poèmes touchants et structurés basés sur le thème que vous choisissez.',
        f2Title: 'Visuels Cinématographiques',
        f2Desc: 'Générez des illustrations atmosphériques de haute qualité en 4K qui s\'accordent parfaitement avec chaque ligne de votre récit.',
        f3Title: 'Voix Immersive',
        f3Desc: 'Donnez vie à vos créations grâce à des voix de synthèse premium, avec un rythme et une émotion adaptés pour sublimer votre message.'
      },
      testimonials: {
        title: 'Témoignages de créateurs',
        subtitle: 'Ils ont boosté leur productivité avec Heartlines.',
        quotes: [
          { name: '@AlexStudio', platform: 'YouTube', text: 'La qualité des visuels est dingue, parfait pour mes intros.' },
          { name: '@LinaContent', platform: 'TikTok', text: 'Gagné 3h de montage sur mes Reels chaque semaine !' },
          { name: '@MarkDigital', platform: 'Facebook', text: 'Mes stories n\'ont jamais eu autant d\'engagement.' },
          { name: '@CreativeFlow', platform: 'YouTube', text: 'L\'IA qui comprend enfin l\'émotion que je veux transmettre.' },
          { name: '@SarahVlog', platform: 'TikTok', text: 'Un gain de temps phénoménal pour mes narrations.' },
          { name: '@JulienEdits', platform: 'YouTube', text: 'Je ne reviendrai jamais en arrière, le studio est intuitif.' },
          { name: '@EmmaTikTok', platform: 'TikTok', text: 'Fini le blocage de la page blanche pour mes scripts !' },
          { name: '@SocialQueen', platform: 'Facebook', text: 'Une esthétique unique qui me démarque de la concurrence.' },
          { name: '@VideoMaster', platform: 'YouTube', text: 'L\'export 4K est d\'une propreté incroyable.' },
          { name: '@TechReview', platform: 'TikTok', text: 'La voix de synthèse est la plus naturelle que j\'ai testée.' }
        ]
      },
      footer: {
        rights: '© 2024 - 2026 Heartlines. Tous droits réservés.'
      },
      apiKey: {
        title: 'Bienvenue sur Heartlines',
        description: 'Générateur de vidéos esthétiques. Veuillez entrer votre clé API Gemini. Elle sera stockée localement dans votre navigateur.',
        label: 'Clé API Gemini',
        placeholder: 'AIzaSy...',
        submit: 'Commencer l\'Édition'
      },
      studio: {
        editorTitle: 'Heartlines',
        editorBadge: 'Éditeur',
        editorSubtitle: 'Définissez votre sujet et votre style visuel, puis créez votre histoire émotionnelle.',
        topicLabel: 'Sujet / Sentiment',
        topicPlaceholder: 'ex: Toi en moi, retrouver l\'amour...',
        styleLabel: 'Paramètres Style Visuel',
        stylePlaceholder: 'ex: cinematic soft noir, 35mm film grain, warm melancholic lighting...',
        styleTip: 'Astuce : Décrivez les couleurs, l\'éclairage et l\'objectif pour une meilleure cohérence.',
        btnGenerateScript: 'Générer le Script',
        btnWritingLines: 'Écriture des lignes...',
        reviewTitle: 'Révision de la Séquence',
        btnStartProduction: 'Lancer la Production',
        btnRemoveKey: 'Supprimer la Clé API',
        previewMode: 'Mode Aperçu',
        library: 'Bibliothèque',
        settings: 'Paramètres',
        masterpieceWait: 'Votre chef-d\'œuvre vous attend...',
        craftingExperience: 'Création de l\'expérience...',
        generatingDescription: 'Génération d\'images 4K et rendu des flux audio IA haute fidélité.',
        complete: 'terminé',
        settingsTitle: 'Paramètres',
        btnSaveConfig: 'Sauvegarder la Configuration',
        aiSuggestions: 'Suggestions IA',
        themePick: 'Choisissez un thème pour votre prochain chef-d\'œuvre',
        btnMoreIdeas: 'Générer plus d\'idées',
        howToSolve: 'Comment résoudre ceci ?',
        solve1: 'Attendez 60 secondes avant de réessayer (limites de Quota).',
        solve2: 'Essayez un modèle différent (les modèles Flash sont plus rapides mais plus limités).',
        solve3: 'Ouvrez la **Bibliothèque** pour télécharger les éléments déjà générés !',
        btnUnderstood: 'Compris',
        mediaLibrary: 'Bilbliothèque Média',
        librarySubtitle: 'Tous les éléments générés pour cette production',
        btnFastExport: 'Export Rapide',
        btnHqExport: 'HQ (FFmpeg)',
        btnDownloadAll: 'Tout Télécharger (ZIP)',
        fastExportTitle: 'Export rapide via enregistrement navigateur (WebM/MP4)',
        hqExportTitle: 'Haute Qualité via FFmpeg (MP4) - Plus lent',
        labels: {
          scriptModel: 'Modèle de Génération (Texte)',
          imageModel: 'Modèle Visuel (Image)',
          ttsModel: 'Modèle Vocal (TTS)',
          voiceTone: 'Voix de l\'IA (Ton)',
          femSoft: 'Féminin - Douce et mélodique',
          maleDeep: 'Masculin - Profond et posé',
          flashLiteDesc: 'Vitesse Ultra-rapide - Idéal pour des brouillons instantanés.',
          flashDesc: 'Équilibre Performance - Le choix standard recommandé.',
          proDesc: 'Intelligence Avancée - Poésie complexe et nuances profondes.',
          legacyDesc: 'Modèle Hérité - Stable et éprouvé.',
          nanoDesc: 'Nano Banana - Styles abstraits et générations rapides.',
          highResDesc: 'Haute Qualité - Textures photoréalistes et profondeur.',
          ttsFlashDesc: 'Recommandé - Voix naturelles et expressives.',
          ttsProDesc: 'Qualité Studio - Clarté cristalline.'
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
