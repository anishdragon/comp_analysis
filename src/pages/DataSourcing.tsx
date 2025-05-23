import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Play, CheckCircle, Upload, FileSpreadsheet, Eye, ArrowRight, Loader2, Plus, Trash2, Building2, Search, ShoppingCart, Users } from 'lucide-react'

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

interface ScrapedData {
  reviews: any[]
  products?: any[]
  sources: any[]
  total_reviews: number
  total_products?: number
}

interface ScrapingProgress {
  currentCompany: string
  currentSource: string
  progress: number
  totalCompanies: number
  completedCompanies: number
  currentStep: string
}

type AnalysisType = 'company' | 'product'

const DataSourcing: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'scrape' | 'upload'>('scrape')
  const [analysisType, setAnalysisType] = useState<AnalysisType>('company')
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
      maxReviews: 100
    }
  ])

  const [products, setProducts] = useState<ProductConfig[]>([
    {
      id: '1',
      companyName: '',
      ecommerceUrl: '',
      searchTerm: '',
      maxProducts: 20
    }
  ])

  const addCompany = () => {
    if (companies.length < 3) {
      const newCompany: CompanyConfig = {
        id: Date.now().toString(),
        companyName: '',
        googlePlayAppId: '',
        trustpilotUrl: '',
        maxReviews: 100
      }
      setCompanies([...companies, newCompany])
    }
  }

  const addProduct = () => {
    if (products.length < 3) {
      const newProduct: ProductConfig = {
        id: Date.now().toString(),
        companyName: '',
        ecommerceUrl: '',
        searchTerm: '',
        maxProducts: 20
      }
      setProducts([...products, newProduct])
    }
  }

  const removeCompany = (id: string) => {
    if (companies.length > 1) {
      setCompanies(companies.filter(company => company.id !== id))
    }
  }

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== id))
    }
  }

  const updateCompany = (id: string, field: keyof Omit<CompanyConfig, 'id'>, value: string | number) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, [field]: value } : company
    ))
  }

  const updateProduct = (id: string, field: keyof Omit<ProductConfig, 'id'>, value: string | number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ))
  }

  const handleScraping = async () => {
    if (analysisType === 'company') {
      const validCompanies = companies.filter(c => c.companyName.trim())
      if (validCompanies.length === 0) {
        alert('Please add at least one company with a name')
        return
      }

      setIsLoading(true)
      setScrapingProgress({
        currentCompany: validCompanies[0].companyName,
        currentSource: 'Initializing...',
        progress: 0,
        totalCompanies: validCompanies.length,
        completedCompanies: 0,
        currentStep: 'Starting company analysis scraping...'
      })

      try {
        const response = await fetch('http://localhost:3001/api/scrape/company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ companies: validCompanies })
        })
        
        if (response.ok) {
          // Handle streaming response for real-time updates
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()

          while (reader) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.progress) {
                    setScrapingProgress(data.progress)
                  }
                  if (data.result) {
                    setScrapedData(data.result)
                    setIsDataAvailable(true)
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } else {
          throw new Error('Scraping failed')
        }
      } catch (error) {
        console.error('Scraping error:', error)
        alert('Scraping failed. Please check your internet connection and try again.')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Product analysis scraping
      const validProducts = products.filter(p => p.companyName.trim() && p.searchTerm.trim())
      if (validProducts.length === 0) {
        alert('Please add at least one product with company name and search term')
        return
      }

      setIsLoading(true)
      setScrapingProgress({
        currentCompany: validProducts[0].companyName,
        currentSource: 'Searching products...',
        progress: 0,
        totalCompanies: validProducts.length,
        completedCompanies: 0,
        currentStep: 'Starting product analysis scraping...'
      })

      try {
        const response = await fetch('http://localhost:3001/api/scrape/product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ products: validProducts })
        })
        
        if (response.ok) {
          // Handle streaming response for real-time updates
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()

          while (reader) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.progress) {
                    setScrapingProgress(data.progress)
                  }
                  if (data.result) {
                    setScrapedData(data.result)
                    setIsDataAvailable(true)
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } else {
          throw new Error('Product scraping failed')
        }
      } catch (error) {
        console.error('Product scraping error:', error)
        alert('Product scraping failed. Please check your URLs and search terms.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('analysisType', analysisType)

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
    a.download = `${analysisType}_analysis_data.csv`
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
      sessionStorage.setItem('analysisType', analysisType)
      if (scrapedData?.products) {
        sessionStorage.setItem('productData', JSON.stringify(scrapedData.products))
      }
      navigate('/analysis')
    }
  }

  const dataToPreview = scrapedData?.reviews || uploadedData
  const totalReviews = scrapedData?.total_reviews || uploadedData.length
  const totalProducts = scrapedData?.total_products || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Data Sourcing
              </h1>
              <p className="text-gray-600 text-lg">
                Choose your analysis type and collect data for insights
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Analysis Type</div>
              <div className="text-lg font-semibold text-blue-600">
                {analysisType === 'company' ? '🏢 Company Competitive' : '🛍️ Product Review'}
              </div>
            </div>
          </div>

          {/* Analysis Type Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAnalysisType('company')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  analysisType === 'company'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <div className="flex items-center mb-3">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Company Competitive Analysis</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Compare companies across Google Play Store and Trustpilot reviews. Max 3 companies.
                </p>
              </button>

              <button
                onClick={() => setAnalysisType('product')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  analysisType === 'product'
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <div className="flex items-center mb-3">
                  <ShoppingCart className="h-8 w-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Product Review Analysis</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Analyze products across e-commerce platforms with pricing, reviews, and sentiment. Max 3 companies.
                </p>
              </button>
            </div>
          </div>
          
          {isDataAvailable && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <span className="text-green-800 font-bold text-xl">
                      Data is ready! 🎉
                    </span>
                    <p className="text-green-700">
                      {totalReviews} reviews{totalProducts > 0 ? ` and ${totalProducts} products` : ''} collected and ready for analysis
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={previewData}
                    className="bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 flex items-center transition-all shadow-md"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Preview Data
                  </button>
                  {scrapedData && (
                    <button
                      onClick={downloadScrapedData}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center transition-all shadow-md"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Excel
                    </button>
                  )}
                  <button
                    onClick={startAnalysis}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Preview Modal */}
      {showPreview && dataToPreview.length > 0 && (
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Data Preview (First 5 rows)</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light"
            >
              ×
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {Object.keys(dataToPreview[0] || {}).map(header => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataToPreview.slice(0, 5).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3">
          <nav className="flex space-x-3">
            <button
              onClick={() => setActiveTab('scrape')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                activeTab === 'scrape'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🕷️ Web Scraping
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
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
        <div className="space-y-8">
          {analysisType === 'company' ? (
            /* Company Analysis Configuration */
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Company Competitive Analysis</h2>
                  <p className="text-gray-600 text-lg">
                    Add up to 3 companies to compare across Google Play Store and Trustpilot
                  </p>
                </div>
                <button
                  onClick={addCompany}
                  disabled={companies.length >= 3}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Company {companies.length < 3 ? `(${companies.length}/3)` : '(Max)'}
                </button>
              </div>

              <div className="space-y-6">
                {companies.map((company, index) => (
                  <div key={company.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Building2 className="h-6 w-6 text-blue-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          Company {index + 1}
                        </h3>
                      </div>
                      {companies.length > 1 && (
                        <button
                          onClick={() => removeCompany(company.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={company.companyName}
                          onChange={(e) => updateCompany(company.id, 'companyName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Max Reviews per Source
                        </label>
                        <input
                          type="number"
                          value={company.maxReviews}
                          onChange={(e) => updateCompany(company.id, 'maxReviews', parseInt(e.target.value) || 100)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          placeholder="100"
                          min="10"
                          max="1000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Google Play App ID
                        </label>
                        <input
                          type="text"
                          value={company.googlePlayAppId}
                          onChange={(e) => updateCompany(company.id, 'googlePlayAppId', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          placeholder="com.example.app"
                        />
                        <p className="text-xs text-gray-500 mt-2">Find this in the Google Play Store URL</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Trustpilot Company URL
                        </label>
                        <input
                          type="url"
                          value={company.trustpilotUrl}
                          onChange={(e) => updateCompany(company.id, 'trustpilotUrl', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          placeholder="https://www.trustpilot.com/review/company.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scraping Progress */}
              {isLoading && scrapingProgress && (
                <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Loader2 className="h-6 w-6 text-blue-600 mr-3 animate-spin" />
                    <span className="text-blue-800 font-semibold text-lg">
                      {scrapingProgress.currentStep}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-4 mb-3">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${scrapingProgress.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    {scrapingProgress.currentCompany} • {scrapingProgress.currentSource} • 
                    Company {scrapingProgress.completedCompanies + 1} of {scrapingProgress.totalCompanies}
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleScraping}
                  disabled={isLoading || companies.every(c => !c.companyName.trim())}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Scraping Companies...
                    </>
                  ) : (
                    <>
                      <Play className="mr-3 h-6 w-6" />
                      Start Company Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Product Analysis Configuration */
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Product Review Analysis</h2>
                  <p className="text-gray-600 text-lg">
                    Add up to 3 e-commerce sites to analyze product pricing, reviews, and sentiment
                  </p>
                </div>
                <button
                  onClick={addProduct}
                  disabled={products.length >= 3}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add E-commerce Site {products.length < 3 ? `(${products.length}/3)` : '(Max)'}
                </button>
              </div>

              <div className="space-y-6">
                {products.map((product, index) => (
                  <div key={product.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <ShoppingCart className="h-6 w-6 text-purple-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          E-commerce Site {index + 1}
                        </h3>
                      </div>
                      {products.length > 1 && (
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Company/Store Name *
                        </label>
                        <input
                          type="text"
                          value={product.companyName}
                          onChange={(e) => updateProduct(product.id, 'companyName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                          placeholder="e.g., Target, Amazon, Best Buy"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Search Term / Product Name *
                        </label>
                        <input
                          type="text"
                          value={product.searchTerm}
                          onChange={(e) => updateProduct(product.id, 'searchTerm', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                          placeholder="e.g., iPhone 15, Samsung TV"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          E-commerce Website URL *
                        </label>
                        <input
                          type="url"
                          value={product.ecommerceUrl}
                          onChange={(e) => updateProduct(product.id, 'ecommerceUrl', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                          placeholder="https://www.target.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Max Products to Analyze
                        </label>
                        <input
                          type="number"
                          value={product.maxProducts}
                          onChange={(e) => updateProduct(product.id, 'maxProducts', parseInt(e.target.value) || 20)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                          placeholder="20"
                          min="5"
                          max="50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Scraping Progress */}
              {isLoading && scrapingProgress && (
                <div className="mt-8 p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Loader2 className="h-6 w-6 text-purple-600 mr-3 animate-spin" />
                    <span className="text-purple-800 font-semibold text-lg">
                      {scrapingProgress.currentStep}
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-4 mb-3">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${scrapingProgress.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-purple-700 font-medium">
                    {scrapingProgress.currentCompany} • {scrapingProgress.currentSource} • 
                    Site {scrapingProgress.completedCompanies + 1} of {scrapingProgress.totalCompanies}
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleScraping}
                  disabled={isLoading || products.every(p => !p.companyName.trim() || !p.searchTerm.trim())}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Scraping Products...
                    </>
                  ) : (
                    <>
                      <Search className="mr-3 h-6 w-6" />
                      Start Product Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Review Data</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Upload an Excel file with the required columns for {analysisType === 'company' ? 'company competitive' : 'product review'} analysis.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-blue-400 transition-colors">
            <FileSpreadsheet className="mx-auto h-20 w-20 text-gray-400 mb-6" />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-lg text-gray-600 font-medium">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {uploadProgress === 100 && (
              <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-3" />
                <p className="text-green-800 font-semibold text-lg">Upload completed successfully!</p>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 inline-flex items-center font-semibold transition-all transform hover:scale-105 shadow-lg text-lg">
                  <Upload className="mr-3 h-6 w-6" />
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
            <p className="text-gray-500 text-lg">
              Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
            </p>
          </div>

          <div className="mt-8 p-8 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Required Columns for Excel Upload:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-blue-700 bg-white p-3 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <strong>datetime</strong> - Date and time of the review
                </div>
              </div>
              <div className="flex items-center text-blue-700 bg-white p-3 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <strong>username</strong> - Name of the reviewer
                </div>
              </div>
              <div className="flex items-center text-blue-700 bg-white p-3 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <strong>content</strong> - The review text content
                </div>
              </div>
              <div className="flex items-center text-blue-700 bg-white p-3 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <strong>source</strong> - Source platform (optional)
                </div>
              </div>
              <div className="flex items-center text-blue-700 bg-white p-3 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <strong>rating</strong> - Numerical rating (optional)
                </div>
              </div>
              <div className="flex items-center text-blue-700 bg-white p-3 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <strong>title</strong> - Review title (optional)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSourcing