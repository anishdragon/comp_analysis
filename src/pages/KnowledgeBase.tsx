import React, { useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Categories')
  const tabs = ['All Categories', 'Product', 'Service', 'Logistics']

  const categories = [
    { name: 'Product Issues', count: 42, color: 'bg-red-100 text-red-800' },
    { name: 'Service Issues', count: 35, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Logistics Issues', count: 28, color: 'bg-blue-100 text-blue-800' },
    { name: 'Website Issues', count: 22, color: 'bg-purple-100 text-purple-800' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
          <p className="text-gray-600">
            Repository of resolutions, SOPs, guides, and best practices.
          </p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <p className="text-sm text-gray-600 mb-4">Browse by issue category</p>
            
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                      {category.count}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Knowledge Base Entries Available</h3>
              <p className="text-gray-600 mb-6">
                Upload and analyze reviews to generate entries.
              </p>
              <div className="text-sm text-gray-500">
                Knowledge base entries are automatically generated from analyzed review data. 
                Start by uploading review data or scraping from various sources to populate this section.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBase