import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DataSourcing from './pages/DataSourcing'
import Analysis from './pages/Analysis'
import KnowledgeBase from './pages/KnowledgeBase'
import Reviews from './pages/Reviews'
import Settings from './pages/Settings'
import ScrapeData from './pages/ScrapeData'

function AppContent() {
  const [apiKey, setApiKey] = useState<string>('')
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative flex h-screen">
        <Sidebar />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
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
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App