import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  BarChart3, 
  Database, 
  FileSearch, 
  BookOpen, 
  MessageSquare, 
  Settings,
  Home,
  TrendingUp
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: Home,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Data Sourcing', 
      path: '/data-sourcing', 
      icon: Database,
      description: 'Upload Files'
    },
    { 
      name: 'Scrape Data', 
      path: '/scrape-data', 
      icon: FileSearch,
      description: 'Collect Reviews'
    },
    { 
      name: 'Analysis', 
      path: '/analysis', 
      icon: BarChart3,
      description: 'AI Insights'
    },
    { 
      name: 'Knowledge Base', 
      path: '/knowledge-base', 
      icon: BookOpen,
      description: 'Insights Library'
    },
    { 
      name: 'Reviews', 
      path: '/reviews', 
      icon: MessageSquare,
      description: 'Browse & Filter'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings,
      description: 'Configuration'
    }
  ]

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Competition Analyser</h1>
            <p className="text-xs text-gray-500">AI-Powered Insights</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Status Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="ml-2 text-sm font-medium text-green-800">System Online</p>
          </div>
          <p className="text-xs text-green-600 mt-1">All services operational</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar