import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PlayIcon, 
  SparklesIcon, 
  ArrowRight01Icon, 
  StarIcon, 
  InstagramIcon, 
  Facebook01Icon, 
  YoutubeIcon, 
  TiktokIcon 
} from '@hugeicons/core-free-icons';
import { useTranslation, Trans } from 'react-i18next';

export function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="w-full max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16 text-center relative z-10">
      
      {/* Floating Social Icons (Left Side - Positioned lower next to subtitle & buttons) */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
        transition={{ 
          opacity: { duration: 0.8, delay: 0.4 },
          x: { duration: 0.8, delay: 0.4 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="hidden lg:flex absolute left-4 xl:left-12 top-[62%] -translate-y-1/2 flex-col gap-6 z-20 pointer-events-none"
      >
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-[#E5E1DA] px-4 py-2.5 rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
            <HugeiconsIcon icon={TiktokIcon} size={16} color="#00f2fe" strokeWidth={2.25} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#1A1A1A]">TikTok</div>
            <div className="text-[10px] font-semibold text-[#8C8275]">Format 9:16</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-[#E5E1DA] px-4 py-2.5 rounded-2xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <HugeiconsIcon icon={InstagramIcon} size={16} color="currentColor" strokeWidth={2.25} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#1A1A1A]">Instagram</div>
            <div className="text-[10px] font-semibold text-[#8C8275]">Reels HD</div>
          </div>
        </div>
      </motion.div>

      {/* Floating Social Icons (Right Side - Positioned lower next to subtitle & buttons) */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{ 
          opacity: { duration: 0.8, delay: 0.4 },
          x: { duration: 0.8, delay: 0.4 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="hidden lg:flex absolute right-4 xl:right-12 top-[62%] -translate-y-1/2 flex-col gap-6 z-20 pointer-events-none"
      >
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-[#E5E1DA] px-4 py-2.5 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shadow-sm">
            <HugeiconsIcon icon={YoutubeIcon} size={16} color="currentColor" strokeWidth={2.25} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#1A1A1A]">Shorts</div>
            <div className="text-[10px] font-semibold text-[#8C8275]">YouTube</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-[#E5E1DA] px-4 py-2.5 rounded-2xl shadow-lg transform -rotate-2 hover:rotate-0 transition-transform pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-sm">
            <HugeiconsIcon icon={Facebook01Icon} size={16} color="currentColor" strokeWidth={2.25} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#1A1A1A]">Facebook</div>
            <div className="text-[10px] font-semibold text-[#8C8275]">Stories</div>
          </div>
        </div>
      </motion.div>
      
      {/* Creator Trust Badge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 py-3 sm:py-2 bg-white border border-[#E5E1DA] rounded-[1.5rem] sm:rounded-full shadow-sm mb-8"
      >
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
          <div className="flex -space-x-2">
            {[ 
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces"
            ].map((src, i) => (
              <img 
                key={i}
                src={src} 
                alt="user avatar" 
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <HugeiconsIcon key={i} icon={StarIcon} size={14} color="currentColor" strokeWidth={2.25} className="fill-current" />
            ))}
          </div>
        </div>
        <p className="text-xs font-semibold text-[#575047] sm:pr-1 text-center">
          <Trans i18nKey="hero.creatorsInfo" count={2400}>
            Plus de <span className="font-bold text-[#1A1A1A]">2 400 créateurs</span> utilisent Heartlines
          </Trans>
        </p>
      </motion.div>
      
      {/* Main Headline */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-bold mb-6 leading-[1.1] tracking-tight text-[#1A1A1A] max-w-5xl mx-auto"
      >
        {t('hero.title_words')} <br className="hidden md:block" />
        <span className="relative inline-block mt-2">
          <span className="bg-[#1A1A1A] text-white px-6 py-2 rounded-2xl -rotate-2 font-normal inline-block shadow-xl border-4 border-white">
            {t('hero.title_badge')}
          </span>
        </span>
        {' '}{t('hero.title_after')}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="text-base md:text-xl text-[#70685C] max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
      >
        {t('hero.subtitle')}
      </motion.p>

      {/* CTA Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-30"
      >
        <motion.button 
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/studio')}
          className="w-full sm:w-auto px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold font-sans text-lg flex items-center justify-center gap-3 hover:bg-[#333333] transition-all shadow-xl group cursor-pointer"
        >
          <HugeiconsIcon icon={SparklesIcon} size={20} color="#C5A880" strokeWidth={2.25} />
          <span>{t('hero.getStarted')}</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="currentColor" strokeWidth={2.25} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
        <motion.a 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="#demo-showcase"
          className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E5E1DA] text-[#1A1A1A] rounded-2xl font-bold font-sans text-lg flex items-center justify-center gap-3 hover:border-[#1A1A1A] transition-all group shadow-sm cursor-pointer"
        >
          <HugeiconsIcon icon={PlayIcon} size={20} color="#C5A880" strokeWidth={2.25} className="fill-current" />
          <span>Découvrir la démo</span>
        </motion.a>
      </motion.div>
    </section>
  );
}
