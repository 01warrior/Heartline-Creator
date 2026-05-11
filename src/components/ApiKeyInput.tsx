import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ApiKeyInputProps {
  onKeySubmit: (key: string) => void;
}

export function ApiKeyInput({ onKeySubmit }: ApiKeyInputProps) {
  const [key, setKey] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] text-[#2D2D2D] font-sans p-6">
      <div className="max-w-md w-full border border-[#E5E1DA] rounded-3xl p-8 bg-white shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-[#F5F2EE] rounded-full mb-6 mx-auto">
          <Key className="w-6 h-6 text-[#C5A880]" />
        </div>
        <h2 className="text-2xl flex font-sans font-bold text-center justify-center mb-2">{t('apiKey.title')}</h2>
        <p className="text-[#7A7570] text-center mb-8 text-sm">
          {t('apiKey.description')}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-[#A8A196] mb-2">
              {t('apiKey.label')}
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-[#F5F2EE] border border-transparent rounded-full px-6 py-3 text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-colors"
              placeholder={t('apiKey.placeholder')}
            />
          </div>
          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full bg-[#1A1A1A] text-white text-sm font-bold py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-black"
          >
            {t('apiKey.submit')}
          </button>
          
          <button
            type="button"
            className="w-full mt-2 bg-transparent border border-[#E5E1DA] text-[#A8A196] text-sm font-bold py-3 rounded-full transition-all cursor-not-allowed opacity-60"
          >
            {t('apiKey.premium')}
          </button>
        </form>
      </div>
    </div>
  );
}
