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
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mt-4">
          Un aperçu du chef-d'œuvre généré
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

            {/* Video Canvas Container with LinkedIn Embedded Video */}
            <div className="w-full h-full rounded-[34px] overflow-hidden relative bg-white pt-6">
              <iframe 
                src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7500045742623866881?collapsed=1" 
                title="Post LinkedIn"
                className="w-full h-full border-0 rounded-[34px]"
                allowFullScreen
              />
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
