import React, { useState } from 'react';
import { Key, ShieldCheck, Lock, ExternalLink, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ApiKeyInputProps {
  onKeySubmit: (key: string) => void;
}

export function ApiKeyInput({ onKeySubmit }: ApiKeyInputProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] text-[#2D2D2D] font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full border border-[#E5E1DA] rounded-3xl p-6 sm:p-10 bg-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background gradient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#1A1A1A]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title */}
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#1A1A1A] tracking-tight">
            {t('apiKey.title')}
          </h1>
          <p className="text-[#8C8275] font-medium text-xs sm:text-sm mt-1">
            {t('apiKey.subtitle')}
          </p>
        </div>

        {/* Reassurance & Security Box */}
        <div className="relative z-10 bg-[#FAF9F7] border border-[#E5E1DA] rounded-2xl p-5 mb-8 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white border border-[#E5E1DA] text-[#1A1A1A] shrink-0 mt-0.5 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <span>{t('apiKey.securityBadge')}</span>
              </h3>
              <p className="text-xs text-[#70685C] leading-relaxed mt-0.5">
                {t('apiKey.securityDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-[#E5E1DA]/60">
            <div className="p-2 rounded-xl bg-white border border-[#E5E1DA] text-[#1A1A1A] shrink-0 mt-0.5 shadow-sm">
              <Key className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                {t('apiKey.whyTitle')}
              </h3>
              <p className="text-xs text-[#70685C] leading-relaxed mt-0.5">
                {t('apiKey.whyDesc')}
              </p>
            </div>
          </div>

          {/* Trust Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-semibold text-[#8C8275]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('apiKey.trust1')}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('apiKey.trust2')}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              {t('apiKey.trust3')}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider font-bold text-[#70685C]">
                {t('apiKey.label')}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#C5A880] hover:text-[#A8885C] transition-colors"
              >
                <span>{t('apiKey.getKey')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl pl-4 pr-11 py-3 text-sm text-[#1A1A1A] placeholder-[#A8A196] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:bg-white transition-all font-mono"
                placeholder={t('apiKey.placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A8A196] hover:text-[#1A1A1A] transition-colors"
                title={showKey ? 'Masquer' : 'Afficher'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full bg-[#1A1A1A] text-white text-sm font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-black hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Lock className="w-4 h-4" />
            <span>{t('apiKey.submit')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
