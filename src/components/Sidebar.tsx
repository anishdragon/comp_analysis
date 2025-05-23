import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Database, 
  FileSearch, 
  BookOpen, 
  MessageSquare, 
  Settings,
  Home,
  TrendingUp,
  Zap
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, color: 'from-blue-500 to-blue-600' },
    { name: 'Data Sourcing', path: '/data-sourcing', icon: Database, color: 'from-green-500 to-green-600' },
    { name: 'Analysis', path: '/analysis', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen, color: 'from-orange-500 to-orange-600' },
    { name: 'Reviews', path: '/reviews', icon: MessageSquare, color: 'from-pink-500 to-pink-600' },
    { name: 'Settings', path: '/settings', icon: Settings, color: 'from-gray-500 to-gray-600' }
  ]

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Competition Analyzer
            </h1>
            <p className="text-xs text-slate-400 mt-1">Next-Gen Intelligence</p>
          </div>
        </motion.div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 px-3">
        {navItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 mb-2 rounded-xl text-slate-300 hover:text-white transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg border border-blue-500/30' 
                    : 'hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl"
                      layoutId="activeBackground"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={`relative p-2 rounded-lg mr-3 ${isActive ? `bg-gradient-to-r ${item.color}` : 'bg-slate-700 group-hover:bg-slate-600'} transition-all duration-300`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium relative z-10">{item.name}</span>
                  {isActive && (
                    <motion.div
                      className="absolute right-2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-6 left-3 right-3">
        <motion.div 
          className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-4 border border-blue-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Pro Features</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Advanced AI analysis with real-time insights and competitive intelligence.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Sidebar