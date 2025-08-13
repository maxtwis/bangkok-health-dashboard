// Updated Footer with Language Support
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = ({ indicatorName = '' }) => {
  const { t } = useLanguage();
  const displayName = indicatorName || t('appTitle');
  
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>{t('appTitle')} - {displayName}</p>
      <p className="text-sm mt-1">{t('ui.footerSource')}</p>
    </footer>
  );
};

export default Footer;