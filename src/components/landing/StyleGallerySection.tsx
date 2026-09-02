import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { STYLE_PRESETS } from '../workflow/workflowConfig';

export const StyleGallerySection: React.FC = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-[#FAF9F6]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-[#1A1A1A] mb-4">
              {t('gallery.title')}
            </h2>
            <p className="text-lg text-[#575047]">
              {t('gallery.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-[650px] lg:h-[500px]">
          {STYLE_PRESETS.map((preset, index) => {
            const isActive = activeIndex === index;
            // Add some placeholder mock images for demonstration since we don't have actual generated ones for the presets saved statically.
            // Wait, we need actual images or placeholders that look good. 
            // I'll use Unsplash images matching the vibe.
            const placeholderImages = [
              "/style-stickman.jpg", // Minimalist abstract (Stickman)
              "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop", // Cinematic Noir
              "/style-impasto.jpg", // Impasto Vertical
              "/style-comics.jpg"  // Comics
            ];

            return (
              <motion.div
                key={preset.id}
                className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ${
                  isActive ? 'flex-1' : 'basis-24 shrink-0'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              >
                {/* Background Image */}
                <img
                  src={placeholderImages[index]}
                  alt={preset.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Dark Overlay for Text Readability */}
                <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
                  isActive ? 'opacity-40' : 'opacity-60 hover:opacity-40'
                }`} />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className={`transition-all duration-500 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 lg:opacity-100 lg:translate-y-0'}`}>
                    
                    {/* Vertical Title (when inactive on desktop) */}
                    {!isActive && (
                      <div className="hidden lg:block absolute bottom-12 left-1/2 -translate-x-1/2 -rotate-90 origin-bottom-left whitespace-nowrap">
                        <span className="text-white font-medium tracking-wider uppercase text-sm">
                          {preset.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Mobile Inactive Title */}
                    {!isActive && (
                      <div className="lg:hidden absolute bottom-6 left-6 whitespace-nowrap">
                        <span className="text-white font-medium tracking-wider uppercase text-sm">
                          {preset.name}
                        </span>
                      </div>
                    )}

                    {/* Active State Content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="relative z-10"
                        >
                          <h3 className="text-2xl md:text-3xl font-serif text-white font-bold mb-3">
                            {preset.name}
                          </h3>
                          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-4 inline-block max-w-lg">
                            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1 block">
                              {t('gallery.promptLabel')}
                            </span>
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                              {preset.prompt}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
