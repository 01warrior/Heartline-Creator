import React from 'react';
import { useTranslation } from 'react-i18next';

export function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = t('testimonials.quotes', { returnObjects: true }) as Array<{name: string, platform: string, text: string}>;
  const row1 = testimonials.slice(0, 5);
  const row2 = testimonials.slice(5, 10);

  return (
    <section id="testimonials-section" className="w-full py-20 overflow-hidden bg-[#FAF9F7]">
      <div className="w-full max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">{t('testimonials.title')}</h2>
        <p className="text-[#70685C] mt-2 font-medium">{t('testimonials.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-6 relative">
        {/* Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FAF9F7] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FAF9F7] to-transparent z-20 pointer-events-none" />

        {/* Row 1 - Direct */}
        <div className="flex whitespace-nowrap gap-6 animate-marquee hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-6">
              {row1.map((t, idx) => (
                <div key={idx} className="bg-white border border-[#E5E1DA] p-6 rounded-2xl shadow-sm min-w-[300px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#FAF9F7] border border-[#E5E1DA] rounded-full flex items-center justify-center text-xs font-bold text-[#C5A880]">
                      {t.name[1]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1A1A1A]">{t.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#A8A196]">{t.platform}</div>
                    </div>
                  </div>
                  <p className="text-sm text-[#70685C] leading-relaxed whitespace-normal italic">"{t.text}"</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Row 2 - Reverse */}
        <div className="flex whitespace-nowrap gap-6 animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-6">
              {row2.map((t, idx) => (
                <div key={idx} className="bg-white border border-[#E5E1DA] p-6 rounded-2xl shadow-sm min-w-[300px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#FAF9F7] border border-[#E5E1DA] rounded-full flex items-center justify-center text-xs font-bold text-[#C5A880]">
                      {t.name[1]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1A1A1A]">{t.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#A8A196]">{t.platform}</div>
                    </div>
                  </div>
                  <p className="text-sm text-[#70685C] leading-relaxed whitespace-normal italic">"{t.text}"</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
