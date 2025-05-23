import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, Save } from 'lucide-react'

interface SettingsProps {
  apiKey: string
  setApiKey: (key: string) => void
}

const Settings: React.FC<SettingsProps> = ({ apiKey, setApiKey }) => {
  const [activeTab, setActiveTab] = useState('API Keys')
  const [tempApiKey, setTempApiKey] = useState(apiKey)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const tabs = ['API Keys', 'General']

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your application settings and API keys.
        </p>
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

      {/* API Keys Tab */}
      {activeTab === 'API Keys' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage your API keys for external services.
            </p>

            {/* API Keys Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">API Keys</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure your API keys for advanced analysis features
              </p>

              {/* API Key Required Warning */}
              {!apiKey && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">API Key Required</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        An Anthropic API key is required for sentiment analysis functionality.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">API Key Saved Successfully</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your Anthropic API key has been saved and is ready to use.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Anthropic API Key Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your Anthropic API key"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is stored locally in your browser for this session only
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  tempApiKey.trim()
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                Save API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'General' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure general application preferences.
            </p>
            <div className="text-center py-8">
              <p className="text-gray-500">General settings will be available in future updates.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings