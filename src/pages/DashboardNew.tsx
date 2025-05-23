import React from 'react'
import { 
  BarChart3, 
  TrendingUp,
  Eye,
  ArrowRight,
  Settings as SettingsIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'

interface DashboardProps {
  apiKey: string
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to the Sentiment Analysis Tool. This dashboard provides an overview of the available features and workflows.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-100">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="workflows" className="text-sm">Workflows</TabsTrigger>
            <TabsTrigger value="capabilities" className="text-sm">Capabilities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Industry Benchmarking */}
              <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900">Industry Benchmarking</CardTitle>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Analyze app reviews and company feedback to benchmark against competitors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                    Get started <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* E-commerce Analysis */}
              <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900">E-commerce Analysis</CardTitle>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Scrape and analyze product data from e-commerce websites.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                    Get started <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900">Analysis Results</CardTitle>
                    <Eye className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    View consolidated results from your analysis jobs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                    View results <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Section */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Getting Started</CardTitle>
                <CardDescription className="text-gray-600">Follow these steps to get the most out of the Sentiment Analysis Tool.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Configure your API key</h3>
                      <p className="text-sm text-gray-600 mt-1">Add your Anthropic API key in the Settings page to enable AI-powered analysis.</p>
                      <Button variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                        Go to Settings <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Choose your analysis type</h3>
                      <p className="text-sm text-gray-600 mt-1">Select either Industry Benchmarking or E-commerce Analysis based on your needs.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Scrape or upload data</h3>
                      <p className="text-sm text-gray-600 mt-1">Either scrape data from websites or upload your own data files.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">View and export results</h3>
                      <p className="text-sm text-gray-600 mt-1">Analyze the results and export them in your preferred format.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Industry Benchmarking Workflow</CardTitle>
                  <CardDescription className="text-gray-600">Analyze app reviews and company feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                    <li>Select companies to analyze</li>
                    <li>Choose data sources (Google Play Store, Trustpilot)</li>
                    <li>Configure scraping parameters</li>
                    <li>Run the analysis</li>
                    <li>View sentiment analysis, category breakdown, and competitive benchmarking</li>
                    <li>Export results or save to knowledge base</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">E-commerce Analysis Workflow</CardTitle>
                  <CardDescription className="text-gray-600">Analyze product data from e-commerce websites</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                    <li>Choose scraping method (URL or search term)</li>
                    <li>Enter product URLs or search terms</li>
                    <li>Configure scraping parameters</li>
                    <li>Run the scraper</li>
                    <li>View price comparison, review sentiment, and product insights</li>
                    <li>Export results for further analysis</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities" className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Key Features</CardTitle>
                <CardDescription className="text-gray-600">Capabilities of the Sentiment Analysis Tool</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Sentiment Analysis</h3>
                    <p className="text-sm text-gray-600">Analyze the sentiment of reviews and feedback using Anthropic's Claude AI</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Category Breakdown</h3>
                    <p className="text-sm text-gray-600">Categorize feedback into predefined or custom categories</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Competitive Benchmarking</h3>
                    <p className="text-sm text-gray-600">Compare your product or service against competitors</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">E-commerce Data Scraping</h3>
                    <p className="text-sm text-gray-600">Scrape product data from major e-commerce websites</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Price Comparison</h3>
                    <p className="text-sm text-gray-600">Compare prices across different retailers</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Actionable Insights</h3>
                    <p className="text-sm text-gray-600">Get data-driven recommendations based on analysis</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Knowledge Base</h3>
                    <p className="text-sm text-gray-600">Save and organize insights for future reference</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard