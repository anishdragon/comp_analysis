import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DataSourcing from './pages/DataSourcing'
import Analysis from './pages/Analysis'
import KnowledgeBase from './pages/KnowledgeBase'
import Reviews from './pages/Reviews'
import Settings from './pages/Settings'

function App() {
  const [apiKey, setApiKey] = useState('')

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard apiKey={apiKey} />} />
          <Route path="/dashboard" element={<Dashboard apiKey={apiKey} />} />
          <Route path="/data-sourcing" element={<DataSourcing />} />
          <Route path="/analysis" element={<Analysis apiKey={apiKey} />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/settings" element={<Settings apiKey={apiKey} setApiKey={setApiKey} />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App