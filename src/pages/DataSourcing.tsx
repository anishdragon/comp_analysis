import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Play, CheckCircle, Upload, FileSpreadsheet, Eye, ArrowRight, Loader2, Plus, Trash2, Building2, ShoppingCart, Users, Star, TrendingUp, Globe, Smartphone } from 'lucide-react'

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
type DataMethod = 'scrape' | 'upload'

const DataSourcing = () => {
  const navigate = useNavigate()
  const [activeAnalysisType, setActiveAnalysisType] = useState<AnalysisType>('company')
  const [activeDataMethod, setActiveDataMethod] = useState<DataMethod>('scrape')
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
    if (activeAnalysisType === 'company') {
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
        const response = await fetch('http://localhost:5000/api/scrape/company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ companies: validCompanies })
        })
        
        if (response.ok) {
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
        const response = await fetch('http://localhost:5000/api/scrape/product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ products: validProducts })
        })
        
        if (response.ok) {
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
    formData.append('analysisType', activeAnalysisType)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('http://localhost:5000/api/upload', {
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
    a.download = `${activeAnalysisType}_analysis_data.csv`
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
      sessionStorage.setItem('analysisType', activeAnalysisType)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Competition Analyser
                  </h1>
                  <p className="text-sm text-gray-500">Data Collection & Analysis Platform</p>
                </div>
              </div>
            </div>
            
            {isDataAvailable && (
              <button
                onClick={startAnalysis}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span className="font-semibold">Start Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Analysis
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Strategy</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock powerful insights from competitor data with our advanced scraping and analysis platform
          </p>
        </div>

        {/* Analysis Type Selection */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveAnalysisType('company')}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                    activeAnalysisType === 'company'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">Company Competitive</div>
                    <div className="text-sm opacity-75">Google Play + Trustpilot</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveAnalysisType('product')}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                    activeAnalysisType === 'product'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">Product Review</div>
                    <div className="text-sm opacity-75">E-commerce Analysis</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {isDataAvailable && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Data Collection Complete! 🎉</h3>
                  <p className="text-green-100">
                    {totalReviews} reviews{totalProducts > 0 ? ` and ${totalProducts} products` : ''} ready for analysis
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={previewData}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                {scrapedData && (
                  <button
                    onClick={downloadScrapedData}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {showPreview && dataToPreview.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
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

        {/* Data Method Selection */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveDataMethod('scrape')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeDataMethod === 'scrape'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🕷️ Web Scraping
                </button>
                <button
                  onClick={() => setActiveDataMethod('upload')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeDataMethod === 'upload'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📁 File Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {activeDataMethod === 'scrape' ? (
            // Web Scraping Section
            <div>
              <div className={`px-8 py-6 border-b border-gray-200 ${
                activeAnalysisType === 'company' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeAnalysisType === 'company' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                      {activeAnalysisType === 'company' ? (
                        <Building2 className="w-6 h-6 text-white" />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {activeAnalysisType === 'company' ? 'Company Competitive Analysis' : 'Product Review Analysis'}
                      </h3>
                      <p className="text-gray-600">
                        {activeAnalysisType === 'company' 
                          ? 'Compare companies across Google Play Store and Trustpilot'
                          : 'Analyze products with pricing, reviews, and sentiment data'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={activeAnalysisType === 'company' ? addCompany : addProduct}
                    disabled={(activeAnalysisType === 'company' ? companies.length : products.length) >= 3}
                    className={`px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all font-semibold ${
                      activeAnalysisType === 'company'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add {activeAnalysisType === 'company' ? 'Company' : 'Product'}</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {activeAnalysisType === 'company' ? companies.length : products.length}/3
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-8">
                {activeAnalysisType === 'company' ? (
                  // Company Analysis Forms
                  <div className="space-y-6">
                    {companies.map((company, index) => (
                      <div key={company.id} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">Company {index + 1}</h4>
                          </div>
                          {companies.length > 1 && (
                            <button
                              onClick={() => removeCompany(company.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Company Name *
                            </label>
                            <input
                              type="text"
                              value={company.companyName}
                              onChange={(e) => updateCompany(company.id, 'companyName', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Enter company name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Max Reviews per Source
                            </label>
                            <input
                              type="number"
                              value={company.maxReviews}
                              onChange={(e) => updateCompany(company.id, 'maxReviews', parseInt(e.target.value) || 100)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="100"
                              min="10"
                              max="1000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                              <Smartphone className="w-4 h-4 mr-2" />
                              Google Play App ID
                            </label>
                            <input
                              type="text"
                              value={company.googlePlayAppId}
                              onChange={(e) => updateCompany(company.id, 'googlePlayAppId', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="com.example.app"
                            />
                            <p className="text-xs text-gray-500 mt-1">Find this in the Google Play Store URL</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                              <Globe className="w-4 h-4 mr-2" />
                              Trustpilot Company URL
                            </label>
                            <input
                              type="url"
                              value={company.trustpilotUrl}
                              onChange={(e) => updateCompany(company.id, 'trustpilotUrl', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="https://www.trustpilot.com/review/company.com"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Product Analysis Forms
                  <div className="space-y-6">
                    {products.map((product, index) => (
                      <div key={product.id} className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">E-commerce Site {index + 1}</h4>
                          </div>
                          {products.length > 1 && (
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Company/Store Name *
                            </label>
                            <input
                              type="text"
                              value={product.companyName}
                              onChange={(e) => updateProduct(product.id, 'companyName', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                              placeholder="e.g., Target, Amazon, Best Buy"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Search Term / Product Name *
                            </label>
                            <input
                              type="text"
                              value={product.searchTerm}
                              onChange={(e) => updateProduct(product.id, 'searchTerm', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                              placeholder="e.g., iPhone 15, Samsung TV"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              E-commerce Website URL *
                            </label>
                            <input
                              type="url"
                              value={product.ecommerceUrl}
                              onChange={(e) => updateProduct(product.id, 'ecommerceUrl', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                              placeholder="https://www.target.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Max Products to Analyze
                            </label>
                            <input
                              type="number"
                              value={product.maxProducts}
                              onChange={(e) => updateProduct(product.id, 'maxProducts', parseInt(e.target.value) || 20)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                              placeholder="20"
                              min="5"
                              max="50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Indicator */}
                {isLoading && scrapingProgress && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center mb-4">
                      <Loader2 className="w-6 h-6 text-blue-600 mr-3 animate-spin" />
                      <div>
                        <h4 className="font-bold text-blue-900">{scrapingProgress.currentStep}</h4>
                        <p className="text-sm text-blue-700">
                          {scrapingProgress.currentCompany} • {scrapingProgress.currentSource}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-4 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${scrapingProgress.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-blue-700 font-medium">
                      Company {scrapingProgress.completedCompanies + 1} of {scrapingProgress.totalCompanies} • {scrapingProgress.progress}%
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={handleScraping}
                    disabled={isLoading || (activeAnalysisType === 'company' ? companies.every(c => !c.companyName.trim()) : products.every(p => !p.companyName.trim() || !p.searchTerm.trim()))}
                    className={`px-12 py-4 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-bold text-lg transition-all transform hover:scale-105 shadow-lg mx-auto ${
                      activeAnalysisType === 'company'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Scraping in Progress...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        <span>Start {activeAnalysisType === 'company' ? 'Company' : 'Product'} Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // File Upload Section
            <div>
              <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Review Data</h3>
                <p className="text-gray-600">
                  Upload an Excel file with review data for {activeAnalysisType === 'company' ? 'company competitive' : 'product review'} analysis
                </p>
              </div>

              <div className="p-8">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors bg-gray-50">
                  <FileSpreadsheet className="mx-auto w-16 h-16 text-gray-400 mb-6" />
                  
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
                      <CheckCircle className="mx-auto w-12 h-12 text-green-600 mb-3" />
                      <p className="text-green-800 font-semibold text-lg">Upload completed successfully!</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 inline-flex items-center space-x-3 font-semibold transition-all transform hover:scale-105 shadow-lg">
                        <Upload className="w-6 h-6" />
                        <span>Choose Excel File</span>
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

                <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Required Excel Columns
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {['datetime', 'username', 'content'].map((field) => (
                        <div key={field} className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                          <div>
                            <span className="font-bold text-blue-900">{field}</span>
                            <p className="text-sm text-blue-700">
                              {field === 'datetime' && 'Date and time of review'}
                              {field === 'username' && 'Name of the reviewer'}
                              {field === 'content' && 'The review text content'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {['source', 'rating', 'title'].map((field) => (
                        <div key={field} className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                          <div>
                            <span className="font-bold text-blue-900">{field}</span>
                            <p className="text-sm text-blue-700">
                              {field === 'source' && 'Source platform (optional)'}
                              {field === 'rating' && 'Numerical rating (optional)'}
                              {field === 'title' && 'Review title (optional)'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataSourcing