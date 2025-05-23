import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DataSourcing from './pages/DataSourcing'
import Analysis from './pages/Analysis'
import KnowledgeBase from './pages/KnowledgeBase'
import Reviews from './pages/Reviews'
import Settings from './pages/Settings'
import ScrapeData from './pages/ScrapeData'
import ComponentShowcase from './pages/ComponentShowcase'

function App() {
  const [apiKey, setApiKey] = useState<string>('')

  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar />
        <main className="flex-1 overflow-auto relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.1),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.5),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,119,198,0.05),_transparent_50%)]" />
          
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard apiKey={apiKey} />
                  </motion.div>
                } />
                <Route path="/dashboard" element={
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard apiKey={apiKey} />
                  </motion.div>
                } />
                <Route path="/data-sourcing" element={
                  <motion.div
                    key="data-sourcing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DataSourcing />
                  </motion.div>
                } />
                <Route path="/scrape-data" element={
                  <motion.div
                    key="scrape-data"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ScrapeData />
                  </motion.div>
                } />
                <Route path="/analysis" element={
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Analysis apiKey={apiKey} />
                  </motion.div>
                } />
                <Route path="/knowledge-base" element={
                  <motion.div
                    key="knowledge-base"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <KnowledgeBase />
                  </motion.div>
                } />
                <Route path="/reviews" element={
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Reviews />
                  </motion.div>
                } />
                <Route path="/showcase" element={
                  <motion.div
                    key="showcase"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ComponentShowcase />
                  </motion.div>
                } />
                <Route path="/settings" element={
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Settings apiKey={apiKey} setApiKey={setApiKey} />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App