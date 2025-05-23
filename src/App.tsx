import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DataSourcing from './pages/DataSourcing'
import Analysis from './pages/Analysis'
import KnowledgeBase from './pages/KnowledgeBase'
import Reviews from './pages/Reviews'
import Settings from './pages/Settings'
import ScrapeData from './pages/ScrapeData'

function App() {
  const [apiKey, setApiKey] = useState<string>('')

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard apiKey={apiKey} />} />
            <Route path="/dashboard" element={<Dashboard apiKey={apiKey} />} />
            <Route path="/data-sourcing" element={<DataSourcing />} />
            <Route path="/scrape-data" element={<ScrapeData />} />
            <Route path="/analysis" element={<Analysis apiKey={apiKey} />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/settings" element={<Settings apiKey={apiKey} setApiKey={setApiKey} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App