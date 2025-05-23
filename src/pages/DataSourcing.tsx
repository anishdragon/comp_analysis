import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Play, CheckCircle, Upload, FileSpreadsheet, Eye, ArrowRight, Loader2, Plus, Trash2, Building2 } from 'lucide-react'

interface CompanyConfig {
  id: string
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

interface ScrapingProgress {
  currentCompany: string
  currentSource: string
  progress: number
  totalCompanies: number
  completedCompanies: number
}

const DataSourcing: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'scrape' | 'upload'>('scrape')
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [isDataAvailable, setIsDataAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [scrapingProgress, setScrapingProgress] = useState<ScrapingProgress | null>(null)
  
  const [companies, setCompanies] = useState<CompanyConfig[]>([
    {
      id: '1',
      companyName: '',
      googlePlayAppId: '',
      trustpilotUrl: '',
      ecommerceUrl: '',
      maxReviews: 100
    }
  ])

  const addCompany = () => {
    const newCompany: CompanyConfig = {
      id: Date.now().toString(),
      companyName: '',
      googlePlayAppId: '',
      trustpilotUrl: '',
      ecommerceUrl: '',
      maxReviews: 100
    }
    setCompanies([...companies, newCompany])
  }

  const removeCompany = (id: string) => {
    if (companies.length > 1) {
      setCompanies(companies.filter(company => company.id !== id))
    }
  }

  const updateCompany = (id: string, field: keyof Omit<CompanyConfig, 'id'>, value: string | number) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, [field]: value } : company
    ))
  }

  const handleScraping = async () => {
    const validCompanies = companies.filter(c => c.companyName.trim())
    if (validCompanies.length === 0) {
      alert('Please add at least one company with a name')
      return
    }

    setIsLoading(true)
    setScrapingProgress({
      currentCompany: '',
      currentSource: '',
      progress: 0,
      totalCompanies: validCompanies.length,
      completedCompanies: 0
    })

    try {
      const response = await fetch('http://localhost:3001/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companies: validCompanies })
      })
      
      if (response.ok) {
        const result = await response.json()
        setScrapedData(result)
        setIsDataAvailable(true)
        setScrapingProgress({
          currentCompany: 'Complete',
          currentSource: 'All sources',
          progress: 100,
          totalCompanies: validCompanies.length,
          completedCompanies: validCompanies.length
        })
      } else {
        throw new Error('Scraping failed')
      }
    } catch (error) {
      console.error('Scraping error:', error)
      alert('Scraping failed. Please check your internet connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (response.ok) {
        const result = await response.json()
        setUploadedData(result.data || [])
        setIsDataAvailable(true)
        
        setTimeout(() => {
          setUploadProgress(0)
        }, 1500)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please check your file format and try again.')
      setUploadProgress(0)
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Sourcing</h1>
          <p className="text-gray-600">Collect review data through scraping multiple companies or file upload</p>
          
          {isDataAvailable && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <span className="text-green-800 font-semibold text-lg">
                      Data is ready! 🎉
                    </span>
                    <p className="text-green-700 text-sm">
                      {totalReviews} reviews collected and ready for analysis
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={previewData}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Data
                  </button>
                  {scrapedData && (
                    <button
                      onClick={downloadScrapedData}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Excel
                    </button>
                  )}
                  <button
                    onClick={startAnalysis}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Preview Modal */}
      {showPreview && dataToPreview.length > 0 && (
        <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Data Preview (First 5 rows)</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(dataToPreview[0] || {}).map(header => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataToPreview.slice(0, 5).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value: any, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
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
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('scrape')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'scrape'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🕷️ Web Scraping
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📁 File Upload
            </button>
          </nav>
        </div>
      </div>

      {/* Web Scraping Tab */}
      {activeTab === 'scrape' && (
        <div className="space-y-6">
          {/* Companies Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Configure Multi-Company Scraping</h2>
                <p className="text-gray-600 mt-1">
                  Add multiple companies to scrape and compare their reviews across platforms
                </p>
              </div>
              <button
                onClick={addCompany}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </button>
            </div>

            <div className="space-y-6">
              {companies.map((company, index) => (
                <div key={company.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Company {index + 1}
                      </h3>
                    </div>
                    {companies.length > 1 && (
                      <button
                        onClick={() => removeCompany(company.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={company.companyName}
                        onChange={(e) => updateCompany(company.id, 'companyName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Reviews per Source
                      </label>
                      <input
                        type="number"
                        value={company.maxReviews}
                        onChange={(e) => updateCompany(company.id, 'maxReviews', parseInt(e.target.value) || 100)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={company.googlePlayAppId}
                        onChange={(e) => updateCompany(company.id, 'googlePlayAppId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={company.trustpilotUrl}
                        onChange={(e) => updateCompany(company.id, 'trustpilotUrl', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.trustpilot.com/review/company.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-commerce Website URL
                      </label>
                      <input
                        type="url"
                        value={company.ecommerceUrl}
                        onChange={(e) => updateCompany(company.id, 'ecommerceUrl', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.target.com or other e-commerce site"
                      />
                      <p className="text-xs text-gray-500 mt-1">We'll automatically find products and reviews</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scraping Progress */}
            {isLoading && scrapingProgress && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <Loader2 className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
                  <span className="text-blue-800 font-medium">
                    Scraping {scrapingProgress.currentCompany}...
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${scrapingProgress.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-blue-700">
                  Company {scrapingProgress.completedCompanies + 1} of {scrapingProgress.totalCompanies} • {scrapingProgress.currentSource}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <button
                onClick={handleScraping}
                disabled={isLoading || companies.every(c => !c.companyName.trim())}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center text-lg font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Multi-Company Scraping
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Review Data</h2>
          <p className="text-gray-600 mb-6">
            Upload an Excel file containing review data. Make sure your file has columns for review content, ratings, and dates.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
            <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {uploadProgress === 100 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-green-800 font-medium">Upload completed successfully!</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 inline-flex items-center font-medium transition-all transform hover:scale-105 shadow-lg">
                  <Upload className="mr-2 h-5 w-5" />
                  Choose Excel File
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleUploadFile}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
            </p>
          </div>

          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-3">📋 Required Columns:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <strong>review_content</strong> - The main review text
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <strong>rating</strong> - Numerical rating (1-5 stars)
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <strong>review_date</strong> - When the review was posted
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                <strong>source</strong> - Platform name (optional)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSourcing