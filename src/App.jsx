// src/App.jsx - Simple routing with original dashboard structure
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/main" element={<Dashboard />} />
              <Route path="/detail" element={<Dashboard />} />
              <Route path="/analysis" element={<Dashboard />} />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;