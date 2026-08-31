import React from 'react';
import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  FeatherIcon, 
  Image01Icon, 
  MusicNote01Icon 
} from '@hugeicons/core-free-icons';
import { useTranslation } from 'react-i18next';

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features-showcase" className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-[#E5E1DA]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880] bg-[#C5A880]/10 px-3 py-1 rounded-full">
          Flux de création simplifié
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mt-3">
          Du poème à la vidéo en 3 étapes simples
        </h2>
        <p className="text-[#70685C] mt-2 text-sm sm:text-base font-medium">
          L'intelligence artificielle orchestre le texte, les images 4K et la narration en quelques secondes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {[
          { step: "01", icon: FeatherIcon, title: t('features.f1Title'), desc: t('features.f1Desc') },
          { step: "02", icon: Image01Icon, title: t('features.f2Title'), desc: t('features.f2Desc') },
          { step: "03", icon: MusicNote01Icon, title: t('features.f3Title'), desc: t('features.f3Desc') }
        ].map((item, index) => {
          const IconComp = item.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -5 }}
              className="p-8 bg-white border border-[#E5E1DA] rounded-3xl shadow-sm hover:border-[#1A1A1A] transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-[#FAF9F7] border border-[#E5E1DA] rounded-2xl flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                  <HugeiconsIcon icon={IconComp} size={24} color="#C5A880" strokeWidth={2.25} />
                </div>
                <span className="text-2xl font-bold text-[#E5E1DA] group-hover:text-[#1A1A1A] transition-colors">{item.step}</span>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{item.title}</h3>
              <p className="text-[#70685C] text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
