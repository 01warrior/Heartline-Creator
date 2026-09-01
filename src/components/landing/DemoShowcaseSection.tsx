import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PlayIcon, 
  SparklesIcon, 
  VolumeHighIcon, 
  Video01Icon, 
  Image01Icon 
} from '@hugeicons/core-free-icons';

export function DemoShowcaseSection() {
  const [isPlayingDemo, setIsPlayingDemo] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);

  return (
    <section id="demo-showcase" className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-[#E5E1DA] text-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880] bg-[#C5A880]/10 px-4 py-1.5 rounded-full">
          Démonstration Visuelle
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold text-[#1A1A1A] mt-4 tracking-tight">
          Un rendu studio professionnel
        </h2>
        <p className="text-[#70685C] mt-2 text-sm sm:text-base font-medium">
          Format vertical 9:16 optimisé pour TikTok, Instagram Reels et YouTube Shorts.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Smartphone 9:16 Video Mockup with Smooth Float Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          animate={{ y: [0, -8, 0] }}
          transition={{ 
            opacity: { duration: 0.8 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative shrink-0"
        >
          <div className="relative mx-auto w-[280px] sm:w-[320px] h-[520px] sm:h-[580px] bg-[#1A1A1A] rounded-[44px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.25)] border-4 border-[#333333] overflow-hidden group">
            {/* iPhone Dynamic Island notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Video Canvas Container */}
            <div className="w-full h-full rounded-[34px] overflow-hidden relative bg-slate-900 flex flex-col justify-between p-6">
              {!hasVideoError ? (
                <video 
                  src="/demo.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  onError={() => setHasVideoError(true)}
                  className="absolute inset-0 w-full h-full object-cover rounded-[34px]"
                />
              ) : (
                <>
                  {/* Background Image Showcase */}
                  <img 
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&fit=crop&q=80" 
                    alt="Cinematic sample visual" 
                    className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                  {/* Top Watermark */}
                  <div className="relative z-10 pt-6 flex justify-between items-center text-white/80 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <HugeiconsIcon icon={SparklesIcon} size={14} color="#C5A880" strokeWidth={2.25} />
                      Heartlines Studio
                    </span>
                    <span className="bg-red-500/80 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold">
                      HD 4K
                    </span>
                  </div>

                  {/* Center Play Button Overlay */}
                  <button 
                    onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                    className="relative z-20 mx-auto w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg cursor-pointer"
                  >
                    {isPlayingDemo ? (
                      <HugeiconsIcon icon={VolumeHighIcon} size={24} color="#C5A880" strokeWidth={2.25} className="animate-pulse" />
                    ) : (
                      <HugeiconsIcon icon={PlayIcon} size={24} color="currentColor" strokeWidth={2.25} className="fill-current ml-1" />
                    )}
                  </button>

                  {/* Subtitles & Audio Waveform Mockup */}
                  <div className="relative z-10 flex flex-col gap-4 text-left">
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 w-fit">
                      <div className="flex items-center gap-1 h-4">
                        {[40, 80, 50, 100, 70, 30, 90, 60, 40, 80].map((h, i) => (
                          <span 
                            key={i} 
                            style={{ height: `${isPlayingDemo ? h : 30}%` }}
                            className="w-1 bg-[#C5A880] rounded-full transition-all duration-300" 
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-white/90 font-mono ml-2">Voiceover IA</span>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                      <p className="text-white text-sm font-serif italic leading-relaxed">
                        "Dans le silence de tes pensées, chaque regard écrit un poème que le temps ne peut effacer..."
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Side Feature Details Cards in this section */}
        <div className="flex flex-col gap-5 max-w-md text-left w-full">
          {[
            {
              icon: Video01Icon,
              title: "Format Vertical 9:16 HD",
              badge: "TikTok • Reels • Shorts",
              desc: "Vos vidéos sont directement composées dans le ratio parfait pour maximiser l'engagement visuel sur mobile."
            },
            {
              icon: VolumeHighIcon,
              title: "Voix Immersive & Onde Sonore",
              badge: "Synthèse Vocale IA",
              desc: "La narration est générée avec un ton chaleureux ou poétique, synchronisée avec des sous-titres animés en temps réel."
            },
            {
              icon: Image01Icon,
              title: "Arrière-plan Poétique 4K",
              badge: "Google Imagen 3",
              desc: "Des visuels cinématographiques haute précision créés spécifiquement pour correspondre aux émotions de vos vers."
            }
          ].map((item, index) => {
            const IconComp = item.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -3 }}
                className="p-6 bg-white border border-[#E5E1DA] rounded-3xl shadow-sm hover:border-[#1A1A1A] transition-all space-y-2 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#FAF9F7] border border-[#E5E1DA] text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                    <HugeiconsIcon icon={IconComp} size={20} color="#C5A880" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A]">{item.title}</h4>
                    <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider">{item.badge}</span>
                  </div>
                </div>
                <p className="text-xs text-[#70685C] leading-relaxed pt-1">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
