import { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
        © 2025 Competition Analyser. All rights reserved.
      </footer>
    </div>
  )
}

export default Layout