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
  Sparkles,
  Activity
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Data Sourcing', path: '/data-sourcing', icon: Database },
    { name: 'Scrape Data', path: '/scrape-data', icon: FileSearch },
    { name: 'Analysis', path: '/analysis', icon: BarChart3 },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
    { name: 'Reviews', path: '/reviews', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-80 glass relative z-10"
    >
      {/* Logo Section */}
      <div className="p-8 border-b border-white/10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center space-x-4"
        >
          <div className="relative">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-20 blur"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Competition</h1>
            <p className="text-sm text-white/70">Analyser</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="p-6 space-y-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `group flex items-center py-4 px-6 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 text-white border border-white/30 shadow-lg' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="h-6 w-6 mr-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.name}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              </div>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-6 left-6 right-6">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass-card p-4 rounded-xl border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">System Status</p>
              <p className="text-xs text-gray-600">All services running</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Sidebar