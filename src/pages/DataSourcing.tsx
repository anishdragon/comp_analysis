import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Play, CheckCircle, Upload, FileSpreadsheet, Eye, ArrowRight, Loader2 } from 'lucide-react'

interface ScrapingConfig {
  companyName: string
  googlePlayAppId: string
  trustpilotUrl: string
  ecommerceUrl: string
  maxReviews: number
}

interface ScrapedData {
  reviews: any[]
  sources: any[]
  total_reviews: number
}

const DataSourcing: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'scrape' | 'upload'>('scrape')
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [isDataAvailable, setIsDataAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const [scrapingConfig, setScrapingConfig] = useState<ScrapingConfig>({
    companyName: '',
    googlePlayAppId: '',
    trustpilotUrl: '',
    ecommerceUrl: '',
    maxReviews: 100
  })

  const handleInputChange = (field: keyof ScrapingConfig, value: string | number) => {
    setScrapingConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleScraping = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scrapingConfig)
      })
      
      if (response.ok) {
        const result = await response.json()
        setScrapedData(result)
        setIsDataAvailable(true)
      } else {
        console.error('Scraping failed')
      }
    } catch (error) {
      console.error('Scraping error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setUploadedData(result.data)
        setIsDataAvailable(true)
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const downloadScrapedData = () => {
    if (!scrapedData) return
    
    const csv = convertToCSV(scrapedData.reviews)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scraped_reviews.csv'
    a.click()
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')
    return csvContent
  }

  const previewData = () => {
    setShowPreview(!showPreview)
  }

  const startAnalysis = () => {
    if (isDataAvailable) {
      const analysisData = scrapedData?.reviews || uploadedData
      sessionStorage.setItem('analysisData', JSON.stringify(analysisData))
      navigate('/analysis')
    }
  }

  const dataToPreview = scrapedData?.reviews || uploadedData
  const totalReviews = scrapedData?.total_reviews || uploadedData.length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Sourcing</h1>
        <p className="text-gray-600">Collect review data through scraping or file upload</p>
        
        {isDataAvailable && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Data is ready! {totalReviews} reviews collected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={previewData}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Data
                </button>
                {scrapedData && (
                  <button
                    onClick={downloadScrapedData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel
                  </button>
                )}
                <button
                  onClick={startAnalysis}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview Modal */}
      {showPreview && dataToPreview.length > 0 && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Data Preview (First 5 rows)</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(dataToPreview[0] || {}).map(header => (
                    <th key={header} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataToPreview.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-b">
                    {Object.values(row).map((value: any, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('scrape')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scrape'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Web Scraping
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              File Upload
            </button>
          </nav>
        </div>
      </div>

      {/* Web Scraping Tab */}
      {activeTab === 'scrape' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Configure Web Scraping</h2>
          <p className="text-gray-600 mb-6">
            Enter company details and sources to automatically collect reviews from multiple platforms
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={scrapingConfig.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Reviews per Source
              </label>
              <input
                type="number"
                value={scrapingConfig.maxReviews}
                onChange={(e) => handleInputChange('maxReviews', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
                min="10"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Play App ID
              </label>
              <input
                type="text"
                value={scrapingConfig.googlePlayAppId}
                onChange={(e) => handleInputChange('googlePlayAppId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="com.example.app"
              />
              <p className="text-xs text-gray-500 mt-1">Find this in the Google Play Store URL</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trustpilot Company URL
              </label>
              <input
                type="url"
                value={scrapingConfig.trustpilotUrl}
                onChange={(e) => handleInputChange('trustpilotUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.trustpilot.com/review/company.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-commerce Website URL
              </label>
              <input
                type="url"
                value={scrapingConfig.ecommerceUrl}
                onChange={(e) => handleInputChange('ecommerceUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.target.com or other e-commerce site"
              />
              <p className="text-xs text-gray-500 mt-1">We'll automatically find products and reviews</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleScraping}
              disabled={!scrapingConfig.companyName || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Scraping
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Review Data</h2>
          <p className="text-gray-600 mb-6">
            Upload an Excel file containing review data. Make sure your file has columns for review content, ratings, and dates.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Excel File
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleUploadFile}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Required Columns:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>review_content</strong> - The main review text</li>
              <li>• <strong>rating</strong> - Numerical rating (1-5 stars)</li>
              <li>• <strong>review_date</strong> - When the review was posted</li>
              <li>• <strong>source</strong> - Platform where review was posted (optional)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSourcing