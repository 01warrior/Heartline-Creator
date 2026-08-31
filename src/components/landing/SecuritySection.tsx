import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SecurityCheckIcon, 
  SecurityLockIcon, 
  GlobalIcon 
} from '@hugeicons/core-free-icons';

export function SecuritySection() {
  const navigate = useNavigate();

  return (
    <section id="privacy-section" className="w-full max-w-7xl mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="bg-[#FAF9F7] border border-[#E5E1DA] rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm"
      >
        <div className="space-y-3 text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full">
            <HugeiconsIcon icon={SecurityCheckIcon} size={16} color="#2E7D32" strokeWidth={2.25} />
            <span>100% Client-Side & Open Source</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Aucun abonnement. Vos clés restent 100% chez vous.
          </h3>
          <p className="text-sm text-[#70685C] leading-relaxed">
            Heartlines ne stocke aucune donnée sur un serveur distant. Votre clé Gemini est sauvegardée localement dans votre navigateur (`localStorage`). Vous gardez un contrôle absolu sur votre confidentialité et vos coûts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/studio')}
            className="px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors shadow-md cursor-pointer"
          >
            <HugeiconsIcon icon={SecurityLockIcon} size={16} color="#C5A880" strokeWidth={2.25} />
            <span>Configurer ma clé</span>
          </motion.button>
          <motion.a 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://github.com/01warrior/Heartline-Creator" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-white border border-[#E5E1DA] text-[#1A1A1A] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:border-[#1A1A1A] transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={GlobalIcon} size={16} color="#70685C" strokeWidth={2.25} />
            <span>Voir le projet GitHub</span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
