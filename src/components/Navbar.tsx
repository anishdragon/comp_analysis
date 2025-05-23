import { NavLink } from 'react-router-dom'
import { BarChart3, Home, Database, BarChart2, BookOpen, MessageSquare, Settings } from 'lucide-react'

const Navbar = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/data-sourcing', icon: Database, label: 'Data Sourcing' },
    { to: '/analysis', icon: BarChart2, label: 'Analysis' },
    { to: '/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
    { to: '/reviews', icon: MessageSquare, label: 'Reviews' },
    { to: '/settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-gray-800" />
          <span className="text-xl font-semibold text-gray-800">Competition Analyser</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar