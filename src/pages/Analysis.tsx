import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, BarChart3, PieChart, TrendingUp, Brain, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface AnalysisProps {
  apiKey: string
}

interface AnalysisResults {
  sentiment_distribution: {
    positive: number
    negative: number
    neutral: number
  }
  issue_categories: Array<{
    category: string
    count: number
    percentage: number
  }>
  emotion_analysis: {
    anger: number
    joy: number
    fear: number
    sadness: number
    surprise: number
  }
  urgency_levels: {
    high: number
    medium: number
    low: number
  }
  processed_reviews: Array<{
    content: string
    sentiment: string
    issue_type: string
    emotion: string
    urgency: string
    confidence: number
  }>
}

const Analysis: React.FC<AnalysisProps> = ({ apiKey }) => {
  const navigate = useNavigate()
  const [analysisData, setAnalysisData] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  useEffect(() => {
    // Load data from session storage
    const storedData = sessionStorage.getItem('analysisData')
    if (storedData) {
      setAnalysisData(JSON.parse(storedData))
    }
  }, [])

  const startAnalysis = async () => {
    if (!apiKey) {
      alert('Please set your Anthropic API key in Settings first!')
      navigate('/settings')
      return
    }

    if (!analysisData.length) {
      alert('No data available for analysis. Please collect data first in Data Sourcing.')
      navigate('/data-sourcing')
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setCurrentStep('Initializing analysis...')

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviews: analysisData,
          api_key: apiKey
        })
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
                if (data.progress !== undefined) {
                  setProgress(data.progress)
                }
                if (data.step) {
                  setCurrentStep(data.step)
                }
                if (data.results) {
                  setAnalysisResults(data.results)
                  // Store results for knowledge base
                  sessionStorage.setItem('analysisResults', JSON.stringify(data.results))
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Please check your API key and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateKnowledgeBase = () => {
    if (analysisResults) {
      sessionStorage.setItem('analysisResults', JSON.stringify(analysisResults))
      navigate('/knowledge-base')
    }
  }

  const viewDetailedReviews = () => {
    if (analysisResults) {
      sessionStorage.setItem('processedReviews', JSON.stringify(analysisResults.processed_reviews))
      navigate('/reviews')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Center</h1>
        <p className="text-gray-600">
          Analyze review data using AI to extract insights and categorize feedback
        </p>
        
        {!apiKey && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                API key required for analysis. 
                <button
                  onClick={() => navigate('/settings')}
                  className="ml-1 text-blue-600 hover:text-blue-800 underline"
                >
                  Set it up in Settings
                </button>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Data Overview */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Data Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysisData.length}</div>
            <div className="text-sm text-blue-800">Total Reviews</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {apiKey ? 'Ready' : 'Needs Setup'}
            </div>
            <div className="text-sm text-green-800">API Status</div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analysisResults ? 'Complete' : 'Pending'}
            </div>
            <div className="text-sm text-purple-800">Analysis Status</div>
          </div>
        </div>
      </div>

      {/* Analysis Controls */}
      {!analysisResults && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Start Analysis</h2>
          <p className="text-gray-600 mb-6">
            Our AI will analyze your reviews to identify sentiment, categorize issues, detect emotions, and assess urgency levels.
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Analysis Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Sentiment Analysis</div>
                  <div className="text-sm text-gray-600">Positive, negative, neutral classification</div>
                </div>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <PieChart className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium">Issue Categorization</div>
                  <div className="text-sm text-gray-600">Group similar complaints and feedback</div>
                </div>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <div className="font-medium">Emotion Detection</div>
                  <div className="text-sm text-gray-600">Identify underlying emotions in reviews</div>
                </div>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <div className="font-medium">Urgency Assessment</div>
                  <div className="text-sm text-gray-600">Prioritize critical issues</div>
                </div>
              </div>
            </div>
          </div>

          {isAnalyzing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Loader2 className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
                <span className="text-blue-800 font-medium">Analyzing reviews...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-blue-700">{currentStep}</div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={startAnalysis}
              disabled={!apiKey || !analysisData.length || isAnalyzing}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="space-y-8">
          {/* Success Banner */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Analysis Complete! {analysisResults.processed_reviews.length} reviews analyzed
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={viewDetailedReviews}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Detailed Reviews
                </button>
                <button
                  onClick={generateKnowledgeBase}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Generate Knowledge Base
                </button>
              </div>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResults.sentiment_distribution.positive}%
                </div>
                <div className="text-sm text-green-800">Positive</div>
              </div>
              <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {analysisResults.sentiment_distribution.neutral}%
                </div>
                <div className="text-sm text-gray-800">Neutral</div>
              </div>
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analysisResults.sentiment_distribution.negative}%
                </div>
                <div className="text-sm text-red-800">Negative</div>
              </div>
            </div>
          </div>

          {/* Issue Categories */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Top Issue Categories</h3>
            <div className="space-y-3">
              {analysisResults.issue_categories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{category.category}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{category.count} reviews</span>
                    <span className="text-sm font-bold text-blue-600">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emotion Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Emotion Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(analysisResults.emotion_analysis).map(([emotion, percentage]) => (
                <div key={emotion} className="text-center p-3 border border-gray-200 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-gray-700 capitalize">{emotion}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Levels */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Urgency Assessment</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analysisResults.urgency_levels.high}%
                </div>
                <div className="text-sm text-red-800">High Priority</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analysisResults.urgency_levels.medium}%
                </div>
                <div className="text-sm text-yellow-800">Medium Priority</div>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResults.urgency_levels.low}%
                </div>
                <div className="text-sm text-green-800">Low Priority</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analysis