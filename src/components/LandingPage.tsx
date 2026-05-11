import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Feather, Image as ImageIcon, Music, ArrowRight } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const testimonials = t('testimonials.quotes', { returnObjects: true }) as Array<{name: string, platform: string, text: string}>;
  const row1 = testimonials.slice(0, 5);
  const row2 = testimonials.slice(5, 10);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#C5A880] selection:text-white">
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center">
          <span className="font-bold text-xl tracking-tight text-[#2D2D2D]">Heartlines</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button 
            onClick={() => navigate('/studio')}
            className="px-6 h-[46px] bg-[#1A1A1A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#C5A880] transition-all shadow-md hover:scale-105 active:scale-95"
          >
            {t('nav.studio')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative z-10">
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex -space-x-3 mb-4">
            {[ 
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces"
            ].map((src, i) => (
              <img 
                key={i}
                src={src} 
                alt="user avatar" 
                className="w-10 h-10 rounded-full border-2 border-[#FDFCFB] object-cover shadow-sm bg-white"
                referrerPolicy="no-referrer"
              />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#FDFCFB] bg-[#C5A880] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              +2k
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#A8A196]">
            <Trans i18nKey="hero.creatorsInfo" count={2400}>
              Plus de <span className="text-[#1A1A1A]">2 400 créateurs</span> utilisent Heartlines
            </Trans>
          </p>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-bold mb-8 leading-[1.1] tracking-tight text-[#2D2D2D] max-w-5xl mx-auto">
          {t('hero.title_words')} <br className="hidden md:block" />
          <span className="relative inline-block mt-2">
            <span className="bg-[#1A1A1A] text-white px-6 py-2 rounded-2xl -rotate-2 font-normal inline-block shadow-2xl border-4 border-[#FDFCFB]">
              {t('hero.title_badge')}
            </span>
          </span>
          {' '}{t('hero.title_after')}
        </h1>
        
        <p className="text-lg md:text-xl text-[#7A7570] max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/studio')}
            className="w-full sm:w-auto px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold font-sans text-lg flex items-center justify-center gap-3 hover:bg-[#C5A880] hover:scale-105 active:scale-95 transition-all shadow-xl group"
          >
            {t('hero.getStarted')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-[#E5E1DA]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Feature 1 */}
          <div className="p-8 bg-white border border-[#E5E1DA] rounded-3xl shadow-sm hover:border-[#C5A880] transition-colors group">
            <div className="w-14 h-14 bg-[#F5F2EE] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#C5A880]/10 transition-colors">
              <Feather className="w-6 h-6 text-[#C5A880]" />
            </div>
            <h3 className="text-xl font-bold text-[#2D2D2D] mb-3">{t('features.f1Title')}</h3>
            <p className="text-[#7A7570] leading-relaxed">
              {t('features.f1Desc')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 bg-white border border-[#E5E1DA] rounded-3xl shadow-sm hover:border-[#C5A880] transition-colors group relative overflow-hidden">
            <div className="w-14 h-14 bg-[#F5F2EE] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#C5A880]/10 transition-colors relative z-10">
              <ImageIcon className="w-6 h-6 text-[#C5A880]" />
            </div>
            <h3 className="text-xl font-bold text-[#2D2D2D] mb-3 relative z-10">{t('features.f2Title')}</h3>
            <p className="text-[#7A7570] leading-relaxed relative z-10">
              {t('features.f2Desc')}
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A880]/5 to-transparent rounded-bl-full pointer-events-none" />
          </div>

          {/* Feature 3 */}
          <div className="p-8 bg-white border border-[#E5E1DA] rounded-3xl shadow-sm hover:border-[#C5A880] transition-colors group">
            <div className="w-14 h-14 bg-[#F5F2EE] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#C5A880]/10 transition-colors">
              <Music className="w-6 h-6 text-[#C5A880]" />
            </div>
            <h3 className="text-xl font-bold text-[#2D2D2D] mb-3">{t('features.f3Title')}</h3>
            <p className="text-[#7A7570] leading-relaxed">
              {t('features.f3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="w-full py-20 overflow-hidden bg-[#FDFCFB]">
        <div className="w-full max-w-7xl mx-auto px-6 mb-12">
          <h2 className="text-3xl font-bold text-[#2D2D2D] tracking-tight">{t('testimonials.title')}</h2>
          <p className="text-[#7A7570] mt-2">{t('testimonials.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-6 relative">
          {/* Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FDFCFB] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FDFCFB] to-transparent z-20 pointer-events-none" />

          {/* Row 1 - Direct */}
          <div className="flex whitespace-nowrap gap-6 animate-marquee hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-6">
                {row1.map((t, idx) => (
                  <div key={idx} className="bg-white border border-[#E5E1DA] p-6 rounded-2xl shadow-sm min-w-[300px]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-[#F5F2EE] rounded-full flex items-center justify-center text-[10px] font-bold text-[#C5A880]">
                        {t.name[1]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1A1A1A]">{t.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[#A8A196]">{t.platform}</div>
                      </div>
                    </div>
                    <p className="text-sm text-[#7A7570] leading-relaxed whitespace-normal italic">"{t.text}"</p>
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
                      <div className="w-8 h-8 bg-[#F5F2EE] rounded-full flex items-center justify-center text-[10px] font-bold text-[#C5A880]">
                        {t.name[1]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1A1A1A]">{t.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[#A8A196]">{t.platform}</div>
                      </div>
                    </div>
                    <p className="text-sm text-[#7A7570] leading-relaxed whitespace-normal italic">"{t.text}"</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="bg-[#1A1A1A] rounded-[2.5rem] border-[3px] border-[#FDFCFB] shadow-xl px-8 py-10 md:px-20 md:py-16 text-center flex flex-col items-center relative overflow-hidden transform -rotate-1">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#C5A880] blur-[120px] opacity-[0.15] pointer-events-none rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-[#FDFCFB] blur-[100px] opacity-[0.05] pointer-events-none rounded-full" />
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight relative z-10">
            {t('cta.title')}
          </h2>
          <p className="text-lg md:text-xl text-[#E5E1DA] opacity-80 max-w-2xl mx-auto mb-10 relative z-10">
            {t('cta.subtitle')}
          </p>
          <button 
            onClick={() => navigate('/studio')}
            className="bg-[#C5A880] text-white px-8 md:px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#B3936A] hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgb(197,168,128,0.3)] flex items-center gap-3 group relative z-10"
          >
            {t('cta.button')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-12 mt-12 border-t border-[#E5E1DA] flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-[#2D2D2D]">Heartlines</span>
        </div>
        <div className="text-[#A8A196] text-[10px] font-bold uppercase tracking-widest">
          {t('footer.rights')}
        </div>
      </footer>

      {/* Decorative background elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C5A880] blur-[150px] opacity-[0.03] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#A8A196] blur-[120px] opacity-[0.03] pointer-events-none rounded-full" />
    </div>
  );
}
