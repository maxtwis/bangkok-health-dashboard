// src/App.jsx - Updated with Language Provider
import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Dashboard from './components/Dashboard/index';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Dashboard />
      </div>
    </LanguageProvider>
  );
}

export default App;