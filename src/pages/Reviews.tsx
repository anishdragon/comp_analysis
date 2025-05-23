import React, { useState } from 'react'
import { Search, Filter } from 'lucide-react'

const Reviews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [dateRange, setDateRange] = useState('Last 3 months')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
        <p className="text-gray-600">
          Browse and search through all analyzed reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            <p className="text-sm text-gray-600 mb-4">Refine your search results</p>

            {/* Sentiment Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Sentiment</h3>
              <div className="space-y-2">
                {['All', 'Positive', 'Negative', 'Neutral'].map((sentiment) => (
                  <label key={sentiment} className="flex items-center">
                    <input
                      type="radio"
                      name="sentiment"
                      value={sentiment}
                      checked={selectedSentiment === sentiment}
                      onChange={(e) => setSelectedSentiment(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{sentiment}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All Categories">All Categories</option>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Logistics">Logistics</option>
                <option value="Website">Website</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Date Range</h3>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Last 3 months">Last 3 months</option>
                <option value="Last 6 months">Last 6 months</option>
                <option value="Last year">Last year</option>
                <option value="All time">All time</option>
              </select>
            </div>

            {/* Toggle Filters */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has KB Entry</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has Response</span>
              </label>
            </div>

            <button className="w-full mt-6 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-lg shadow border p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Available Yet</h3>
              <p className="text-gray-600 mb-6">
                Upload Excel files to analyze reviews.
              </p>
              <div className="text-sm text-gray-500">
                Once you upload review data or complete scraping, all analyzed reviews will appear here 
                with sentiment analysis, categorization, and filtering options.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reviews