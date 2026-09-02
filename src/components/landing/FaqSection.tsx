import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { PlusIcon, MinusIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export const FaqSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeQ, setActiveQ] = useState<number>(1);

  const questions = [
    { id: 1, q: t('faq.q1'), a: t('faq.a1') },
    { id: 2, q: t('faq.q2'), a: t('faq.a2') },
    { id: 3, q: t('faq.q3'), a: t('faq.a3') },
    { id: 4, q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <section className="py-24 bg-white border-t border-[#E5E1DA]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-start pt-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-[#1A1A1A] mb-4">
                {t('faq.title')}
              </h2>
              <p className="text-lg text-[#575047] mb-8 lg:mb-0">
                {t('faq.subtitle')}
              </p>
            </motion.div>
          </div>

          {/* Right Column: Q&A Layout (Creative Interactive List) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {questions.map((item, index) => {
              const isActive = activeQ === item.id;

              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`border-b border-[#E5E1DA] overflow-hidden transition-colors duration-300 ${
                    isActive ? 'bg-[#FAF9F6] rounded-2xl border-transparent p-6 sm:p-8 shadow-sm' : 'py-6 px-2 hover:bg-[#FAF9F6]/50 rounded-xl cursor-pointer'
                  }`}
                  onClick={() => setActiveQ(item.id)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <h3 className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${isActive ? 'text-[#1A1A1A]' : 'text-[#575047]'}`}>
                      {item.q}
                    </h3>
                    
                    {/* Icon toggle */}
                    <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
                      isActive ? 'bg-black text-white border-black' : 'border-[#E5E1DA] text-[#A39E93]'
                    }`}>
                      <HugeiconsIcon icon={isActive ? MinusIcon : PlusIcon} size={20} color="currentColor" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="pt-6 text-base sm:text-lg leading-relaxed text-[#575047] max-w-3xl">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          
        </div>
      </div>
    </section>
  );
};
