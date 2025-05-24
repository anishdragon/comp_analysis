import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, TrendingUp, TrendingDown, Tag, ArrowRight } from 'lucide-react'

interface DashboardProps {
  apiKey: string
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey }) => {
  const navigate = useNavigate()

  const stats = [
    { title: 'Total Reviews', value: '0', subtitle: 'Reviews analyzed' },
    { title: 'Positive Sentiment', value: '0%', subtitle: 'Of all reviews' },
    { title: 'Negative Sentiment', value: '0%', subtitle: 'Of all reviews' },
    { title: 'Categories', value: '0', subtitle: 'Categories identified' }
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Competition Analyser Dashboard
        </h1>
        <p className="text-gray-600">
          Analyze customer reviews and track competitive positioning to gain actionable insights.
        </p>
      </div>

      {/* API Key Warning */}
      {!apiKey && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">API Key Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This application requires an Anthropic API key to analyze reviews. Please add your API key to continue.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Add API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                {index === 0 && <Tag className="h-4 w-4 text-gray-600" />}
                {index === 1 && <TrendingUp className="h-4 w-4 text-green-600" />}
                {index === 2 && <TrendingDown className="h-4 w-4 text-red-600" />}
                {index === 3 && <Tag className="h-4 w-4 text-blue-600" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Get Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">No uploads yet. Upload your first Excel file to get started.</p>
          </div>
        </div>

        {/* Get Started */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h2>
          <p className="text-gray-600 mb-4">Begin by sourcing data for analysis</p>
          <p className="text-sm text-gray-500 mb-6">
            To get started with sentiment analysis and competitive insights, you need to first source data.
            You can either scrape data from various sources or upload your own data.
          </p>
          <button
            onClick={() => navigate('/data-sourcing')}
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Data Sourcing
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard