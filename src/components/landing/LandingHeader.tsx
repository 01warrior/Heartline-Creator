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
            className="px-5 sm:px-6 h-[44px] bg-[#1A1A1A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#333333] transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
            className="md:hidden p-2.5 text-[#1A1A1A] bg-white border border-[#E5E1DA] rounded-xl hover:bg-[#FAF9F7] transition-colors flex items-center justify-center"
            aria-label="Menu"
          >
            <HugeiconsIcon icon={isMobileMenuOpen ? Cancel01Icon : Menu01Icon} size={20} color="currentColor" strokeWidth={2.25} />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-[#E5E1DA] px-6 py-4 flex flex-col gap-4 overflow-hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-bold text-sm text-[#1A1A1A] hover:text-[#C5A880] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/01warrior/Heartline-Creator"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm text-[#70685C] flex items-center gap-2 pt-2 border-t border-[#E5E1DA]"
            >
              <HugeiconsIcon icon={GlobalIcon} size={16} color="currentColor" strokeWidth={2.25} />
              <span>GitHub Repository</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
