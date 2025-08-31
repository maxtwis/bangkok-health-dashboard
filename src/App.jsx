// src/App.jsx - Updated with React Router, Error Boundary and Language Provider
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import MainMenu from './pages/MainMenu';
import AnalysisPage from './pages/AnalysisPage';
import IndicatorDetailPage from './pages/IndicatorDetailPage';
import GeographicPage from './pages/GeographicPage';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<MainMenu />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/detail/:indicator" element={<IndicatorDetailPage />} />
              <Route path="/geographic" element={<GeographicPage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;