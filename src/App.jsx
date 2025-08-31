// src/App.jsx - Updated with Error Boundary and Language Provider
import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Dashboard from './components/Dashboard/index';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <div className="App">
          <Dashboard />
        </div>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;