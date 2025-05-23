import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

interface AnalysisProps {
  apiKey: string
}

const Analysis: React.FC<AnalysisProps> = ({ apiKey }) => {
  const navigate = useNavigate()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis</h1>
        <p className="text-gray-600">
          Review sentiment analysis and insights.
        </p>
      </div>

      {/* API Key Required Warning */}
      {!apiKey ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">API Key Required</h3>
              <p className="text-yellow-700 mt-1">
                To analyze reviews, you need to add your Anthropic API key in the settings.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready for Analysis</h2>
            <p className="text-gray-600 mb-6">
              Upload data or complete scraping to begin sentiment analysis with Anthropic Claude.
            </p>
            <button
              onClick={() => navigate('/data-sourcing')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Source Data for Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analysis