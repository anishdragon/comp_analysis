import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  Heart, 
  TrendingUp, 
  Users, 
  Award, 
  BarChart3,
  Calendar,
  Settings,
  ChevronRight,
  Play,
  Pause,
  Volume2
} from 'lucide-react'

// Import all our beautiful UI components
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table'
import { Progress } from '../components/ui/Progress'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'

const ComponentShowcase = () => {
  const [progressValue, setProgressValue] = useState(65)

  const analyticsData = [
    { metric: "User Engagement", value: 94, trend: "+12%", color: "text-green-500" },
    { metric: "Conversion Rate", value: 87, trend: "+8%", color: "text-blue-500" },
    { metric: "Customer Satisfaction", value: 92, trend: "+15%", color: "text-purple-500" },
    { metric: "Revenue Growth", value: 78, trend: "+23%", color: "text-orange-500" }
  ]

  const reviewsData = [
    { platform: "Google Reviews", rating: 4.8, reviews: 2847, sentiment: "positive" },
    { platform: "Trustpilot", rating: 4.6, reviews: 1523, sentiment: "positive" },
    { platform: "App Store", rating: 4.4, reviews: 892, sentiment: "mixed" },
    { platform: "Product Hunt", rating: 4.9, reviews: 367, sentiment: "positive" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Component Showcase
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the full power of our enterprise-grade UI components with beautiful animations, 
            professional styling, and seamless interactions.
          </p>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {analyticsData.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.metric}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{item.value}%</p>
                    <p className={`text-sm font-medium ${item.color}`}>
                      {item.trend}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <Progress value={item.value} className="mt-3" />
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Competition Analysis Overview
                    </CardTitle>
                    <CardDescription>
                      Real-time insights into your competitive landscape
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Market Position</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Leading
                          </Badge>
                          <span className="text-sm text-muted-foreground">#2 in category</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Competitive Score</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            High Performance
                          </Badge>
                          <span className="text-sm text-muted-foreground">8.7/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Overall Progress</Label>
                      <Progress value={progressValue} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0%</span>
                        <span className="font-medium">{progressValue}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                        <Star className="h-8 w-8 text-yellow-300" />
                      </div>
                      <h3 className="font-semibold">Top Performer</h3>
                      <p className="text-sm text-white/80">
                        Your platform ranks in the top 5% for customer satisfaction
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Review Platform Analysis</CardTitle>
                  <CardDescription>
                    Comprehensive review data across all major platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Reviews</TableHead>
                        <TableHead>Sentiment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewsData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.platform}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{item.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.reviews.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.sentiment === 'positive' ? 'default' : 'secondary'}
                              className={item.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            >
                              {item.sentiment}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription>
                      User interaction and engagement trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['Daily Active Users', 'Session Duration', 'Page Views', 'Bounce Rate'].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.random() * 100} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Performance Indicators</CardTitle>
                    <CardDescription>
                      Key performance metrics and benchmarks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Conversion', value: '12.4%', trend: '+2.1%' },
                        { label: 'Retention', value: '89.2%', trend: '+5.3%' },
                        { label: 'Satisfaction', value: '94.1%', trend: '+1.8%' },
                        { label: 'Growth', value: '23.7%', trend: '+8.9%' }
                      ].map((item, index) => (
                        <div key={index} className="text-center space-y-1">
                          <p className="text-2xl font-bold">{item.value}</p>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-xs text-green-500 font-medium">{item.trend}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Platform Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your competition analysis settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" placeholder="Enter your company name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input id="industry" placeholder="Select your industry" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL</Label>
                      <Input id="website" placeholder="https://yourwebsite.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="competitors">Competitors</Label>
                      <Input id="competitors" placeholder="Competitor domains" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset to Default</Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                    Save Configuration
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Play className="h-4 w-4 mr-2" />
            Start Analysis
          </Button>
          <Button size="lg" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button size="lg" variant="secondary">
            <Users className="h-4 w-4 mr-2" />
            Share Results
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default ComponentShowcase