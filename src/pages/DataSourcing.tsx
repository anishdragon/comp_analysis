import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Play, CheckCircle, ArrowRight } from 'lucide-react'

const DataSourcing: React.FC = () => {
  const navigate = useNavigate()

  const scrapeFeatures = [
    'Scrape reviews from multiple sources',
    'Compare up to 3 companies at once',
    'Configure the number of reviews to collect',
    'Download the scraped data for future use'
  ]

  const uploadFeatures = [
    'Upload existing review data from Excel',
    'Use a standardized template format',
    'Preview data before analysis',
    'Combine multiple data sources'
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Sourcing</h1>
        <p className="text-gray-600">
          Choose a method to collect data for sentiment analysis and knowledge base creation.
        </p>
      </div>

      {/* Data Source Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scrape Data Card */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scrape Data</h2>
          <p className="text-gray-600 mb-6">
            Automatically collect reviews from Google Play Store, Trustpilot, and company websites.
          </p>
          
          <ul className="space-y-3 mb-6">
            {scrapeFeatures.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate('/scrape-data')}
            className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-medium"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Scraping
          </button>
        </div>

        {/* Upload Data Card */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Data</h2>
          <p className="text-gray-600 mb-6">
            Upload your own Excel file with review data for analysis.
          </p>
          
          <ul className="space-y-3 mb-6">
            {uploadFeatures.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              // For now, we'll create a simple file upload interface
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.xlsx,.xls'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  // Handle file upload - this will integrate with your Python backend
                  console.log('File selected:', file.name)
                  // Navigate to analysis with uploaded data
                  navigate('/analysis')
                }
              }
              input.click()
            }}
            className="w-full bg-white text-gray-900 border-2 border-gray-300 px-4 py-3 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Upload Data
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          © 2025 Competition Analyser. All rights reserved.
        </p>
        <div className="mt-2 flex items-center text-sm text-blue-600">
          <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
            ✨ Created by Anish Prasad
          </span>
        </div>
      </div>
    </div>
  )
}

export default DataSourcing