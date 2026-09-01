import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowRight01Icon, 
  GlobalIcon, 
  Menu01Icon, 
  Cancel01Icon 
} from '@hugeicons/core-free-icons';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';

export function LandingHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#demo-showcase', label: 'Démo' },
    { href: '#features-showcase', label: 'Fonctionnalités' },
    { href: '#privacy-section', label: 'Sécurité' },
    { href: '#testimonials-section', label: 'Avis' }
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-[100] w-full backdrop-blur-md bg-white/90 border-b border-[#E5E1DA] shadow-sm transition-all"
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-bold text-xl tracking-tight text-[#1A1A1A]">Heartlines</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-xs uppercase tracking-wider text-[#70685C]">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href}
                className="hover:text-[#1A1A1A] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/studio')}
              className="hidden sm:flex px-5 sm:px-6 h-[44px] bg-[#1A1A1A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#333333] transition-all shadow-md items-center gap-2 cursor-pointer"
            >
              <span>{t('nav.studio')}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" strokeWidth={2.25} className="text-[#C5A880]" />
            </motion.button>
            <motion.a 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href="https://github.com/01warrior/Heartline-Creator"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex px-5 h-[44px] bg-white border border-[#E5E1DA] text-[#1A1A1A] rounded-2xl text-xs font-bold uppercase tracking-wider hover:border-[#1A1A1A] transition-all shadow-sm items-center gap-2 cursor-pointer"
            >
              <HugeiconsIcon icon={GlobalIcon} size={16} color="currentColor" strokeWidth={2.25} className="text-[#70685C]" />
              <span>GitHub</span>
            </motion.a>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2.5 text-[#1A1A1A] bg-white border border-[#E5E1DA] rounded-xl hover:bg-[#FAF9F7] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Menu"
            >
              <HugeiconsIcon icon={isMobileMenuOpen ? Cancel01Icon : Menu01Icon} size={20} color="currentColor" strokeWidth={2.25} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Navigation Right Sliding Sidebar Drawer (Outside motion.header for full 100vh viewport coverage) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] sm:hidden"
            />

            {/* Sliding Sidebar Panel (85vw width, full screen height) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 h-screen w-[85vw] max-w-[360px] bg-white z-[160] sm:hidden p-6 flex flex-col justify-between border-l border-[#E5E1DA] shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
                  <span className="font-bold text-lg tracking-tight text-[#1A1A1A]">Heartlines</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[#70685C] hover:text-[#1A1A1A] hover:bg-[#FAF9F7] rounded-xl transition-colors cursor-pointer"
                    aria-label="Fermer le menu"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={20} color="currentColor" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Primary Studio Action inside Sidebar */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/studio');
                  }}
                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#333333] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('nav.studio')}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" strokeWidth={2.25} className="text-[#C5A880]" />
                </button>

                {/* Navigation Links */}
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A196] mb-1">Navigation</span>
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-bold text-base text-[#1A1A1A] hover:text-[#C5A880] transition-colors py-2 border-b border-[#F5F2EE] flex items-center justify-between group"
                    >
                      <span>{link.label}</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" strokeWidth={2.25} className="text-[#A8A196] group-hover:text-[#C5A880] group-hover:translate-x-1 transition-all" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Sidebar Footer Controls */}
              <div className="pt-6 border-t border-[#E5E1DA] space-y-4">
                <a
                  href="https://github.com/01warrior/Heartline-Creator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl text-xs font-bold text-[#1A1A1A] flex items-center justify-center gap-2 hover:border-[#1A1A1A] transition-colors"
                >
                  <HugeiconsIcon icon={GlobalIcon} size={16} color="currentColor" strokeWidth={2.25} className="text-[#70685C]" />
                  <span>Dépôt GitHub</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
