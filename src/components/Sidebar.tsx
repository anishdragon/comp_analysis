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
  Zap,
  ChevronRight,
  PanelLeft
} from 'lucide-react'
import { Sidebar as SidebarPrimitive, SidebarProvider, useSidebar } from './ui/SidebarProvider'
import { Button } from './ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/Tooltip'
import { cn } from '../lib/utils'

const SidebarContent = () => {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, color: 'from-blue-500 to-blue-600' },
    { name: 'Data Sourcing', path: '/data-sourcing', icon: Database, color: 'from-green-500 to-green-600' },
    { name: 'Analysis', path: '/analysis', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen, color: 'from-orange-500 to-orange-600' },
    { name: 'Reviews', path: '/reviews', icon: MessageSquare, color: 'from-pink-500 to-pink-600' },
    { name: 'Showcase', path: '/showcase', icon: TrendingUp, color: 'from-cyan-500 to-cyan-600' },
    { name: 'Settings', path: '/settings', icon: Settings, color: 'from-gray-500 to-gray-600' }
  ]

  const SidebarItem = ({ item, isActive }: { item: typeof navItems[0], isActive: boolean }) => {
    const content = (
      <NavLink
        to={item.path}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-slate-800/50 hover:text-white",
          isActive 
            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg border border-blue-500/30" 
            : "text-slate-300",
          isCollapsed ? "justify-center px-2" : ""
        )}
      >
        <div className={cn(
          "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
          isActive ? `bg-gradient-to-r ${item.color}` : "bg-slate-700 group-hover:bg-slate-600"
        )}>
          <item.icon className="h-4 w-4 text-white" />
        </div>
        {!isCollapsed && (
          <span className="truncate">{item.name}</span>
        )}
        {!isCollapsed && isActive && (
          <motion.div
            className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </NavLink>
    )

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      )
    }

    return content
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Competition Analyzer
              </h1>
              <p className="text-xs text-slate-400">Next-Gen Intelligence</p>
            </div>
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <PanelLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <SidebarItem 
              item={item} 
              isActive={window.location.pathname === item.path}
            />
          </motion.div>
        ))}
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="p-4">
          <motion.div 
            className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-4 border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
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
      )}
    </>
  )
}

const Sidebar = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarPrimitive 
        collapsible="icon"
        className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700"
      >
        <SidebarContent />
      </SidebarPrimitive>
    </SidebarProvider>
  )
}

export default Sidebar