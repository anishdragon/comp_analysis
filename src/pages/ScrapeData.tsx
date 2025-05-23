import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react'

const ScrapeData: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    companyName: '',
    googlePlayAppId: '',
    trustpilotUrl: '',
    ecommerceUrl: '',
    googlePlayReviews: 500,
    trustpilotReviews: 300,
    ecommerceReviews: 100
  })
  const [validationError, setValidationError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStartScraping = () => {
    // Validation
    if (!formData.companyName) {
      setValidationError('Company name is required')
      return
    }
    setValidationError('')
    
    // This will integrate with your Python backend scraping functionality
    console.log('Starting scraping with config:', formData)
    // Navigate to a scraping progress page or back to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/data-sourcing')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scrape Data</h1>
        <p className="text-gray-600">
          Configure and start scraping reviews from multiple sources.
        </p>
      </div>

      <div className="max-w-4xl">
        {/* Scraping Configuration */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scraping Configuration</h2>
          <p className="text-sm text-gray-600 mb-6">
            Set up the companies and sources to scrape data from.
          </p>

          {/* Number of Companies */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of companies to analyze
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="1">1 Company</option>
            </select>
          </div>

          {/* Company 1 */}
          <div className="border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company 1</h3>
            
            {/* Company Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Source Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Play Store
                </label>
                <div className="mb-2">
                  <label className="block text-xs text-gray-500 mb-1">App ID</label>
                  <input
                    type="text"
                    name="googlePlayAppId"
                    value={formData.googlePlayAppId}
                    onChange={handleInputChange}
                    placeholder="com.example.app"
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">The app id from the Google Play Store URL (e.g., com.example.app)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trustpilot
                </label>
                <div className="mb-2">
                  <label className="block text-xs text-gray-500 mb-1">Company URL</label>
                  <input
                    type="text"
                    name="trustpilotUrl"
                    value={formData.trustpilotUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.trustpilot.com/review/..."
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-commerce
                </label>
                <div className="mb-2">
                  <label className="block text-xs text-gray-500 mb-1">Website URL</label>
                  <input
                    type="text"
                    name="ecommerceUrl"
                    value={formData.ecommerceUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Review Count Configuration */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Count Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the number of reviews to scrape from each source. Only sources that are selected in the company configuration will be used.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Play Store Reviews
                </label>
                <input
                  type="number"
                  name="googlePlayReviews"
                  value={formData.googlePlayReviews}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: 1, Maximum: 1000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trustpilot Reviews
                </label>
                <input
                  type="number"
                  name="trustpilotReviews"
                  value={formData.trustpilotReviews}
                  onChange={handleInputChange}
                  min="1"
                  max="500"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: 1, Maximum: 500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-commerce Reviews (Target, Amazon, etc.)
                </label>
                <input
                  type="number"
                  name="ecommerceReviews"
                  value={formData.ecommerceReviews}
                  onChange={handleInputChange}
                  min="1"
                  max="200"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: 1, Maximum: 200</p>
              </div>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                  <p className="text-sm text-red-700 mt-1">{validationError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Important Note */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Scraping may take several minutes depending on the number of reviews requested. Please do not close this page during scraping.
                </p>
              </div>
            </div>
          </div>

          {/* Start Scraping Button */}
          <button
            onClick={handleStartScraping}
            className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Start Scraping
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScrapeData