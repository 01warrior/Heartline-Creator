import React from 'react';
import { useTranslation } from 'react-i18next';
import { HugeiconsIcon } from '@hugeicons/react';
import { TiktokIcon, InstagramIcon, YoutubeIcon, GithubIcon } from '@hugeicons/core-free-icons';

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-[#FAF9F7] border-t border-[#E5E1DA]">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand & Mission */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                <span className="text-white text-xs font-serif font-bold">H</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1A1A1A]">Heartlines</span>
            </div>
            <p className="text-[#575047] text-sm leading-relaxed max-w-sm mb-6">
              Le premier studio de création conçu pour les histoires courtes verticales émotionnelles. Ne payez plus d'abonnements, utilisez directement l'IA Google.
            </p>
            <div className="flex items-center gap-4 text-[#8C8275]">
              <a href="#" className="hover:text-black transition-colors"><HugeiconsIcon icon={TiktokIcon} size={22} /></a>
              <a href="#" className="hover:text-black transition-colors"><HugeiconsIcon icon={InstagramIcon} size={22} /></a>
              <a href="#" className="hover:text-black transition-colors"><HugeiconsIcon icon={YoutubeIcon} size={22} /></a>
              <a href="#" className="hover:text-black transition-colors"><HugeiconsIcon icon={GithubIcon} size={22} /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-4">Produit</h4>
            <ul className="flex flex-col gap-3 text-sm text-[#575047]">
              <li><a href="#" className="hover:text-black transition-colors">Studio</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Styles Visuels</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Pricing (Gratuit)</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-4">Légal & Aide</h4>
            <ul className="flex flex-col gap-3 text-sm text-[#575047]">
              <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Conditions d'utilisation</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-[#E5E1DA] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#8C8275] font-medium">
          <div>
            {t('footer.rights')}
          </div>
          <div className="flex items-center gap-2">
            <span>Made for creators.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
