import React from 'react';

const Footer = ({ indicatorName = '' }) => {
  const displayName = indicatorName || 'Health Indicators';
  
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>Bangkok Health Inequalities Dashboard - {displayName}</p>
      <p className="text-sm mt-1">ข้อมูลจากโครงการตรวจสุขภาพล้านคน สำนักการแพทย์ กรุงเทพมหานคร</p>
    </footer>
  );
};

export default Footer;