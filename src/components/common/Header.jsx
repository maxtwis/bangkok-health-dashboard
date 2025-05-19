import React from 'react';

const Header = ({ indicatorName = 'Alcohol Drinking Rate' }) => {
  return (
    <header className="bg-blue-700 text-white p-4 shadow-md">
      <h1 className="text-2xl font-bold">Bangkok Health Inequalities Dashboard</h1>
      <p className="mt-1">{indicatorName} by District (2566-2568)</p>
    </header>
  );
};

export default Header;