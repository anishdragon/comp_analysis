import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Upload } from 'lucide-react'

interface CompanyConfig {
  id: string
  companyName: string
  googlePlayAppId: string
  trustpilotUrl: string
  maxReviews: number
}

interface ProductConfig {
  id: string
  companyName: string
  ecommerceUrl: string
  searchTerm: string
  maxProducts: number
}

const DataSourcing = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [companies] = useState<CompanyConfig[]>([
    {
      id: '1',
      companyName: '',
      googlePlayAppId: '',
      trustpilotUrl: '',
      maxReviews: 100
    }
  ])

  const handleStartScraping = async () => {
    setIsLoading(true)
    // Scraping logic will be implemented
    setTimeout(() => {
      setIsLoading(false)
      navigate('/analysis')
    }, 2000)
  }

  const handleUploadData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    // Upload logic will be implemented
    setTimeout(() => {
      setIsLoading(false)
      navigate('/analysis')
    }, 1500)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Sourcing</h1>
        <p className="text-gray-600">Choose a method to collect data for sentiment analysis and knowledge base creation.</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Scrape Data Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scrape Data</h2>
          <p className="text-gray-600 mb-6">Automatically collect reviews from Google Play Store, Trustpilot, and company websites.</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Scrape reviews from multiple sources</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Compare up to 3 companies at once</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Configure the number of reviews to collect</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Download the scraped data for future use</span>
            </div>
          </div>

          <button
            onClick={handleStartScraping}
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{isLoading ? 'Starting...' : 'Start Scraping'}</span>
          </button>
        </div>

        {/* Upload Data Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Data</h2>
          <p className="text-gray-600 mb-6">Upload your own Excel file with review data for analysis.</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Upload existing review data from Excel</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Use a standardized template format</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Preview data before analysis</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
              <span className="text-gray-600">Combine multiple data sources</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUploadData}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isLoading ? 'Uploading...' : 'Upload Data'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>© 2025 Competition Analyser. All rights reserved.</span>
          <div className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            <span>⭐</span>
            <span>Created by Anish Prasad</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataSourcing