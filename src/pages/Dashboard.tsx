import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Target, 
  ArrowUpRight, 
  Activity,
  Globe,
  Zap,
  Star,
  MessageSquare,
  Database,
  Brain,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

interface DashboardProps {
  apiKey: string
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey }) => {
  const navigate = useNavigate()

  const stats = [
    {
      title: "Total Reviews Analyzed",
      value: "24,652",
      change: "+12.5%",
      trend: "up",
      icon: MessageSquare,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Data Sources",
      value: "8",
      change: "+2",
      trend: "up", 
      icon: Database,
      color: "from-green-500 to-green-600"
    },
    {
      title: "AI Insights Generated",
      value: "1,847",
      change: "+45.2%",
      trend: "up",
      icon: Brain,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Competitive Advantage",
      value: "94%",
      change: "+8.1%",
      trend: "up",
      icon: Target,
      color: "from-orange-500 to-orange-600"
    }
  ]

  const recentAnalyses = [
    {
      company: "TechCorp Inc.",
      type: "Sentiment Analysis",
      status: "completed",
      sentiment: 85,
      reviews: 1250,
      time: "2 hours ago"
    },
    {
      company: "StartupXYZ",
      type: "Competitive Intelligence", 
      status: "processing",
      sentiment: 72,
      reviews: 890,
      time: "4 hours ago"
    },
    {
      company: "Enterprise Solutions",
      type: "Market Research",
      status: "completed",
      sentiment: 91,
      reviews: 2100,
      time: "6 hours ago"
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
              Competition Intelligence Dashboard
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Real-time insights and competitive analysis powered by AI
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="success" className="px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
            <Button className="shadow-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* API Key Warning */}
      {!apiKey && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 mr-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800">API Key Required</h3>
                  <p className="text-yellow-700 mt-1">
                    This application requires an Anthropic API key to analyze reviews and generate insights.
                  </p>
                  <Button
                    onClick={() => navigate('/settings')}
                    variant="outline"
                    className="mt-3 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    Configure API Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant={stat.trend === 'up' ? 'success' : 'destructive'} className="font-medium">
                    {stat.change}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/20 pointer-events-none" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-full border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span>Recent Analyses</span>
              </CardTitle>
              <CardDescription>
                Latest competitive intelligence and sentiment analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnalyses.map((analysis, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {analysis.company.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{analysis.company}</h4>
                        <p className="text-sm text-gray-600">{analysis.type}</p>
                        <p className="text-xs text-gray-500">{analysis.reviews} reviews • {analysis.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-gray-900">{analysis.sentiment}%</div>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                        <Badge 
                          variant={analysis.status === 'completed' ? 'success' : 'secondary'}
                          className="mt-1"
                        >
                          {analysis.status}
                        </Badge>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/data-sourcing')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Start New Analysis
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Compare Competitors
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Target className="w-4 h-4 mr-2" />
                View Market Insights
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-blue-50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-white/80 border border-purple-100">
                  <p className="text-sm text-gray-700 font-medium">
                    📈 Customer satisfaction increased by 12% this quarter
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/80 border border-blue-100">
                  <p className="text-sm text-gray-700 font-medium">
                    🎯 New opportunity detected in mobile app reviews
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/80 border border-green-100">
                  <p className="text-sm text-gray-700 font-medium">
                    💡 Competitor weakness identified in pricing strategy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard