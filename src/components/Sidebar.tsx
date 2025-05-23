import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  BarChart3, 
  Database, 
  FileSearch, 
  BookOpen, 
  MessageSquare, 
  Settings,
  Home
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Data Sourcing', path: '/data-sourcing', icon: Database },
    { name: 'Analysis', path: '/analysis', icon: BarChart3 },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
    { name: 'Reviews', path: '/reviews', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <FileSearch className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Competition Analyser</span>
        </div>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar