import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from 'react-i18next';

export function CtaFinalSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="bg-[#1A1A1A] rounded-[2.5rem] border-[3px] border-white shadow-2xl px-8 py-10 md:px-20 md:py-16 text-center flex flex-col items-center relative overflow-hidden"
      >
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#C5A880] blur-[120px] opacity-[0.2] pointer-events-none rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-white blur-[100px] opacity-[0.05] pointer-events-none rounded-full" />
        
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight relative z-10">
          {t('cta.title')}
        </h2>
        <p className="text-base md:text-xl text-[#E5E1DA] opacity-85 max-w-2xl mx-auto mb-10 relative z-10 font-medium leading-relaxed">
          {t('cta.subtitle')}
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/studio')}
          className="bg-[#C5A880] text-white px-8 md:px-10 py-4 rounded-2xl font-bold text-base md:text-lg whitespace-nowrap hover:bg-[#B3936A] transition-all shadow-[0_8px_20px_rgb(197,168,128,0.3)] flex items-center gap-3 group relative z-10 cursor-pointer"
        >
          <HugeiconsIcon icon={SparklesIcon} size={20} color="#FFFFFF" strokeWidth={2.25} />
          <span>{t('cta.button')}</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="currentColor" strokeWidth={2.25} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </section>
  );
}
